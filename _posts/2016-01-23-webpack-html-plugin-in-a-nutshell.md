---
layout: post
title: Webpack HTML plug-in in a Nutshell
tags:
    - Webpack
---

I am using Webpack for several months now, and I ended up to some more optimized
solutions than the one given in the [Webpack introduction post](http://localhost:4000/2015/05/15/howto-setup-webpack-on-es6-react-application-with-sass.html). Using the [Webpack
HTML Plugin](https://github.com/ampedandwired/html-webpack-plugin) allows to counter
some limitations of the HTML file we used in the previous post.

## Hard-Written Paths, Cache Busting... Help!

If we apply literally the previous post way to setup our HTML, it would result to
something like:

``` html
<!DOCTYPE html>
<html>
    <head>
        <link href="http://localhost:8080/css/style.css" rel="stylesheet" />
    </head>
    <body>
        <h1>My Application</h1>
        <script src="http://localhost:8080/js/main.js"></script>
    </body>
</html>
```

It may look like a correct solution. However, it is not satisfactory enough for
a production deployment. For instance, the hard-written URL with `localhost` won't
work elsewhere than on your machine.

<p class="center">
    <img src="/img/posts/html-webpack-plugin/on-my-machine-it-works.jpg" alt="On my machine, it works!" title="On my machine, it works!" />
</p>

Of course, you can simply `sed` your build output, or use two several indexes (an `index.dev.html`
and an `index.html` files), but that's far to be optimal. And what about adding some
cache busters at each generation?

That's where the [HTML Webpack Plugin]((https://github.com/ampedandwired/html-webpack-plugin)) comes into play.

## HTML Webpack Plugin: the Right Way to Load your HTML Template

We install the [HTML Webpack Plugin](https://github.com/ampedandwired/html-webpack-plugin)
like all other Webpack packages, using `npm`:

``` sh
npm install --save-dev html-webpack-plugin
```

### Basic configuration

Then, we add the plugin to our Webpack configuration:

``` js
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: 'index.html',
            template: __dirname + '/index.html',
        })
    ]
};
```

This is the most standard configuration. We configured the plugin using the file
at `/index.html` as a template and serving it as `index.html` (the `filename`
property). We set `hash` to `true` to let Webpack handle the cache busting
automatically.

If we run Webpack with this extra configuration, we can access our application
directly on `http://localhost:8080`. However, we shouldn't notice any change.
And indeed, our `index.html` file has still hard-written paths.

So, let's just use some variables available thanks to the HTML plugin:

``` xml
{% raw %}
<!DOCTYPE html>
<html>
    <head>
        <title>My Awesome Project</title>
        <link href="{%= o.htmlWebpackPlugin.files.css %}" rel="stylesheet">
    </head>
    <body>
        <h1>My Application</h1>
        <script src="{%= o.htmlWebpackPlugin.files.js %}"></script>
    </body>
</html>
{% endraw %}
```

The `o.htmlWebpackPlugin.files` variable is an object containing especially two
useful keys: `css` and `js`. These keys allow us to loop through all our entries,
inserting them properly in our page. It solves our both issues: hard-written paths
and cache-busting (thanks to the `hash` configuration property).

Note that we have to relaunch Webpack as template changes are not taken into account
by watching daemon.

### Passing Variables to our HTML Template

If we wanted to specify other variables in our HTML, we just have to retrieve them
directly using the `o.htmlWebpackPlugin.options` variable. For instance, let's consider we
updated our configuration to add current environment to our config object:

``` js
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: 'index.html',
            template: __dirname + '/index.html',
            environment: process.env.NODE_ENV
        })
    ]
};
```

Then, we would be able to retrieve it in our HTML using:

``` xml
{% raw %}
<!DOCTYPE html>
<html>
    <head>
        <title>({%= o.htmlWebpackPlugin.options.environment %}) My Awesome Project</title>
        <link href="{%= o.htmlWebpackPlugin.files.css %}" rel="stylesheet">
    </head>
    <body class="{%= o.htmlWebpackPlugin.options.environment %}">
        <h1>My Application</h1>
        <script src="{%= o.htmlWebpackPlugin.files.js %}"></script>
    </body>
</html>
{% endraw %}
```

This code allows us to differentiate our site depending of environment. For instance,
we may put a red background on production. It would prevent us from committing to the
world some testing data.

## Bonus: Generating Static Websites with Webpack

This plug-in is really useful. But, let's take it to its logical conclusion by
generating a whole static website. It may be useful to
add a few presentation pages to an existing single page application. And this plug-in
helps us to do so, without having to add a new technology such as [Jekyll](https://jekyllrb.com/)
on our stack.

As this plug-in doesn't allow to include other HTML files into the main one, we
need some JavaScript here:

``` js
import fs from 'fs';
import glob from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default () => {
    const realContentFolderPath = fs.realpathSync(__dirname + '/static/pages/');
    const layout = fs.readFileSync(`static/layout.html`, { encoding: 'utf8' });

    const generatePage = template => {
        const pageContent = fs.readFileSync(template, { encoding: 'utf-8' });
        return layout.replace('{# PAGE_CONTENT #}', pageContent);
    }

    const pages = glob.sync(contentDir + '/**/*.html');
    return pages.map(page => new HtmlWebpackPlugin({
        templateContent: generatePage(page),
        filename: page.replace(realContentFolderPath, ''),
        hash: true
    }));
};
```
This ES6 snippet above shows a function we use to generate static web pages from a
given folder (here: `/static/pages`). For each HTML file in this folder, we plug
a new instance of the HTML plug-in using the file name as an entry-point.

Unlike the first configuration sample, we are not using `template` here but
`templateContent`, which is either a string or a function returning a string:
the page content. And to prevent from repeating the same menu everywhere, we
have embedded all our contents into a higher `layout.html` template, just replacing
the `{# PAGE_CONTENT #}` string by the final file content.

That's a good solution for *really* basic needs. We can also easily customize
the title, or add an `active` class to current page in the navigation bar, still
using some basic JavaScript. But if our needs become more complex, let's be pragmatic,
and switch to a more robust solution such as Jekyll.
