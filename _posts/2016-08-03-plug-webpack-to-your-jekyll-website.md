---
layout: post
title: "Plugging Webpack to Jekyll Powered Pages"
---

As I already explained on this blog, I chose [Jekyll](https://jekyllrb.com/) to build this blog.
It allows a blazing-fast display (as this blog is just pure static HTML) and [a free
hosting on GitHub Pages](http://localhost:4000/2012/12/25/migrating-to-github-pages.html).
Yet, when I started to build these pages a few years ago, I didn't know about Webpack.
Better late than never, let's see how to plug these two powerful tools together.

## Using Jekyll via Docker

Running Jekyll requires Ruby and some other dependencies. As I don't need Ruby except
for Jekyll, I rather like to use a Docker container. There is probably an image
from Docker registry which would work well. Yet, as I am in vacation with a
really slow Internet connection, I use an image I already have on my computer (the
one we use on [marmelab's blog](http://marmelab.com/blog/)).Here is the related
`Dockerfile`:

<pre>FROM ubuntu:14.04

ENV DEBIAN_FRONTEND noninteractive
ENV HOME /root

RUN apt-get update && \
    apt-get upgrade --yes

RUN apt-get install --quiet --yes curl
RUN apt-get install --quiet --yes git
RUN apt-get install --quiet --yes make
RUN apt-get install --quiet --yes npm
RUN apt-get install --quiet --yes python-software-properties
RUN apt-get install --quiet --yes software-properties-common
RUN apt-add-repository ppa:brightbox/ruby-ng
RUN apt-get update
RUN apt-get install --quiet --yes ruby2.2 ruby2.2-dev ruby-switch
RUN ruby-switch --set ruby2.2

RUN npm install --global n
RUN npm install --global bower

RUN n 0.10

RUN gem install --no-rdoc --no-ri jekyll -v 3.0.1

WORKDIR /srv/

EXPOSE 4000

ENTRYPOINT ["jekyll"]</pre>

In order to get more concise Docker launch command, we are going to use `docker-compose`.
Create a `docker-compose.yml` file with the following content:

``` yaml
jekyll:
    build: docker/
    volumes:
        - .:/srv
    ports:
        - "4000:4000"
    command: serve --host=0.0.0.0 --watch
```

We retrieve our `Dockerfile` from the `docker` folder, mount our project folder
into the `/src` container folder and open 4000 port to outside world. And then,
we launch the command `jekyll serve` (`jekyll` coming from the configured `ENTRYPOINT`)
with `--watch` argument to refresh automatically.

## Setting Up Webpack

First of all, let's install all our required dependencies:

``` sh
npm install --save-dev \
    css-loader \
    extract-text-webpack-plugin \
    file-loader \
    sass-loader \
    webpack \
    webpack-dev-server
```

### Basic Webpack Configuration

Webpack configuration is quite basic in this case. We just want to compile SASS
files into pure CSS:

``` js
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        `${__dirname}/sass/style.scss`,
    ],
    output: {
        path: './build/',
        publicPath: '/',
        filename: 'build.js',
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass?outputStyle=expanded'),
                include: `${__dirname}/sass`,
            },
            {
                test: /\.(woff2?|svg|ttf|eot|png|jpe?g|gif|ico|pdf)?$/,
                loader: `file?name=[path][name].[ext]`,
                include: [`${__dirname}/sass`, `${__dirname}/posts`],
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin('style.css', {
            allChunks: true,
        }),
    ],
    devtool: 'eval-cheap-module-source-map',
};
```

To sum up these lines, we compile every `scss` files in the `sass/` folder into
`style.css` file, taking into account every images in the `sass/` and `posts/` folders.

If you are not familiar with this configuration, please refer to my [Webpack introduction
post](/2015/05/15/howto-setup-webpack-on-es6-react-application-with-sass.html).

Executing `./node_modules/.bin/webpack-dev-server` should serve your stylesheet at
`http://localhost:8080/style.css`.

### Running Webpack Dev Server and Jekyll Concurrently

We now have two different servers. Launching them manually works fine, but it requires
two different commands. Too cumbersome. So, we are going to add a new dependency to
our project:

``` sh
npm install --save-dev concurrently
```

`concurrently` allows to launch two (or more) commands in parallel. That's the
perfect package for our purpose. We now just need to add a new command in our
`package.json` file:

``` js
{
    "scripts": {
        "start": "concurrently 'docker-compose up' 'webpack-dev-server --host=0.0.0.0'",
    }
}
```

Launching our project locally is now done using:

``` sh
npm start
```

## Updating our Jekyll Layout

We need to tell Jekyll to retrieve our stylesheet at correct location. It can be
done easily modifying our main template (`_layouts/default.html` for this blog):

``` xml
<link rel="stylesheet" href="http://localhost:8080/style.css" />
```

Or, for more flexibility, we can move the assets base URL into our `_config.yml` file:

``` yaml
assets_base_url: 'http://localhost:8080/'
```

Now, we can use this variable through the `site` object in our layout:

``` xml
<link rel="stylesheet" href="{{ site.assets_base_url }}style.css" />
```

It works locally. Yet, when pushing our code to GitHub, we won't be able to fetch
our assets from `localhost` as the dev server won't be started. Instead, we have to
build our assets using `webpack` and use the generated `build/style.css` file.

So, we need to handle two different configuration files, depending our environment
(dev for dev server, prod for built files). An easy way to handle it is to take profit
of our Docker configuration and to specify our container two configuration files, such as:

``` sh
serve \
    --config _config.yml,_config.dev.yml \
    --host=0.0.0.0 \
    --watch
```

With this configuration, Jekyll would fetch all configuration parameters from our
`_config.yml` file, and override all parameters by those from `_config.dev.yml` file
if they exist. So, we just need to create the `_config.dev.yml` file with following
content:

``` yaml
assets_base_url: 'http://localhost:8080/'
```

And update our `_config.yml` file with:

``` yaml
assets_base_url: '/build/'
```

As GitHub considers only the `_config.yml` file, it would now work on both dev
and production environment.

### Enabling Live-Reload

Enabling live-reload is quite easy. We just need to add the built `script` tag
to our layout:

``` xml
<script src="{{ site.assets_base_url }}build.js" />
```

And add the two following options to our Webpack dev server call:

``` sh
webpack-dev-server --inline --hot
```

## Deploying our Pages

We still need to push our pages to GitHub `gh-pages` branch to deploy a new version
of our website. However, we should not forget to rebuild Webpack assets. Let's automate
it adding a custom `deploy` command in your `package.json`:

``` js
{
    "scripts": {
        "deploy": `
            webpack -p &&
            git add build/ &&
            (git commit -m 'Rebuilding assets' || true) &&
            git push origin master
        `
    }
}
```
The above snippet won't work. For readability reasons, I splitted the command on
several lines and used some templated string (using back quotes). So, don't just
copy/paste.

Note the `|| true` during the assets commit. It is required in case of the built
files have not changed since the last commit. If nothing changed, this line would
trigger an error we ignore thanks to the `true`.

Deploying our website is now as simple as:

``` sh
npm run deploy
```

Adding a GitHub pre-push hook may look a better solution at first glance. But it would
need to commit built files and push them from the pre-push hook, occuring an infinite
recursion. We may handle this case, ensuring we rebuild file only from the outer push, but
it would add a lot of complexity. Let's keep it simple, stupid.
