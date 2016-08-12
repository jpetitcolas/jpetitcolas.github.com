---
layout: post
title: "Plugging Webpack to Jekyll Powered Pages"
---

I chose [Jekyll](https://jekyllrb.com/) to power this blog. It allows a blazing-fast
display (as rendering is just composed of pure HTML static files) and [a free
hosting on GitHub Pages](/2012/12/25/migrating-to-github-pages.html).
Yet, when I started to build these pages a few years ago, I didn't know about Webpack.
Better late than never, let's see how to plug these two powerful tools together.

## Using Jekyll via Docker

Running Jekyll requires Ruby and some other dependencies. As I don't need Ruby except
for Jekyll, I prefer to use a Docker container. Thanks to Docker ecosystem,
there is strong chances that someone already made an image fitting our needs. And,
indeed, we can use [starefossen/github-pages](https://github.com/Starefossen/docker-github-pages)
image:

``` sh
docker run -v $PWD:/usr/src/app -p 4000:4000 starefossen/github-pages
```

We just run the image, exposing port 4000 to the outside world and mounting current
working directory (`$PWD`) in the expected container source files location (`/usr/src/app`).

Let's add this quite long command into our `package.json` file:

``` js
{
    // [...]
    "scripts": {
        "start": "docker run -v $PWD:/usr/src/app -p 4000:4000 starefossen/github-pages"
    }
}
```

This way, instead of typing the previous boring command, we just need to type:

``` sh
npm start
```

## Setting Up Webpack

For our blog purpose, we have really basic needs: we just want to compile and
compress some SASS files to a CSS single file.

First of all, let's install all required dependencies:

``` sh
npm install --save-dev \
    css-loader \
    extract-text-webpack-plugin \
    file-loader \
    sass-loader \
    webpack \
    webpack-dev-server
```

Webpack configuration is quite basic in our case:

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
two different commands. Too cumbersome. So, let's add a new dependency to
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
        "start": "concurrently 'docker run -v $PWD:/usr/src/app -p 4000:4000 starefossen/github-pages' 'webpack-dev-server --host=0.0.0.0'",
    }
}
```

If we try to launch our project using the previous command, it would fail
as `$PWD` is not translated to current working directory. That's a [concurrently
issue](https://github.com/kimmobrunfeldt/concurrently/issues/52) I didn't solve yet.
Meanwhile, we can still hard-write our project path:

``` js
{
    "scripts": {
        "start": "concurrently 'docker run -v /home/johndoe/myproject:/usr/src/app -p 4000:4000 starefossen/github-pages' 'webpack-dev-server --host=0.0.0.0'",
    }
}
```

That's not optimal, but it works. Launching our project locally is now done using:

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
<link rel="stylesheet" href="{% raw %}{{ site.assets_base_url }}{% endraw %}style.css" />
```

It works locally. Yet, when pushing our code to GitHub, we won't be able to fetch
our assets from `localhost` as the dev server won't be started. Instead, we have to
build our assets using `webpack` and use the generated `build/style.css` file.

So, we need to handle two different configuration files, depending our environment
(dev for dev server, prod for built files). An easy way to handle it is to take profit
of our Docker use, specifying our container two configuration files.
Let's override Jekyll launch parameters updating Docker `run` command:

``` js
{
    "scripts": {
        "start": "concurrently 'docker run [...] starefossen/github-pages jekyll serve --config _config.yml,_config.dev.yml -d /_site --watch --force_polling -H 0.0.0.0 -P 4000'",
    }
}
```
The only change here is we repeated the [default command executed in Dockerfile](https://github.com/Starefossen/docker-github-pages/blob/master/Dockerfile#L13)
adding it a `--config` parameter.

With this new parameter, Jekyll would fetch all configuration parameters from our
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

Enabling live-reload is quite easy. We just need to add the built `script` to our layout:

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
it adding a custom `deploy` command in our `package.json` file:

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
