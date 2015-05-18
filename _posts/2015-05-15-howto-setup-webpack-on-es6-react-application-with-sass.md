---
layout: post
title: How-to setup Webpack on an ES6 React Application with SASS?
tags: Webpack, React, SASS, ES6
---

I spent some time lately to play with [Webpack](https://github.com/webpack/webpack). As Grunt or Gulp, Webpack is a JavaScript bundler, allowing to turn our messy and numerous JavaScript into a single minified and optimized script. I used to use Gulp, but taking a look on Webpack and all its features made me switch pretty quickly, especially because of its `webpack-dev-server` and `react-hot-loader` killing features, increasing drastically our development workflow. 

The only blot with this tool is its documentation. There are a lot of pages about all the available options, but not a real-world get started tutorial. After spending days to figure out the best way to handle with my application, here is a summary for an ES6 React application using some SASS.

## Setting up Webpack

Let's write a very simple and useless application splitted into two files:

``` js
// js/hello.js
console.log('Hello');
```

``` js
// js/world.js
console.log('World');
```

Including these two scripts into our page outputs `Hello World!`. Nothing to write home about for the moment. Then fetch Webpack:

``` sh
npm init
npm install --save-dev webpack
```

It's time to write our `webpack.config.js` file to tell Webpack to concatenate these two files together:

``` js
module.exports = {
    entry: {
        helloWorld: './js/helloworld'
    },
    output: {
        filename: 'public/[name].js'
    }
};
```

This file says Webpack to take `./js/helloworld` as an input and to process it into a `public/helloWorld.js` file.

Here is the content of our new `helloworld.js` script:

``` js
require('./hello');
require('./world');
```

Let's compile our entry using the following command line:

``` sh
./node_modules/webpack/bin/webpack.js
```

There is a new file in `public` folder, containing a lot of code, especially the definition of a `__webpack__require__` function. Adding this generated script alone into our page still displays the same message in the console. That's the default behavior of Webpack: concatenating all your dependencies into a single file, preventing from sending a bench of different HTTP requests.

That's fine, it reduces number of requests. But size is still the addition of my two dependency, plus size of all Webpack internals. Fortunately, you also can minify your scripts with Webpack. Just give it a `--production` (or `-p`) flag:

``` sh
./node_modules/webpack/bin/webpack.js -p
```

With such a simple case, we pass from 1.7kb to 305 bytes.

## Live-Reload with Webpack

One of the most useful features in my daily developer life is live-reload. Concept is pretty simple: when you save a file, it automatically refreshes your browser. No need to press F5 anymore. Looks like a lazy developer tip, but it really increases your productivity, especially with dual-screen.

### Setting up Webpack Dev Server

Currently, we had to launch the webpack compilation command to refresh our file. Let's take a step further using the `webpack-dev-server`:

``` sh
npm install --save-dev webpack-dev-server
```

This module serves all your compiled files through a web server (by default on `localhost:8080`). This way, all our files are computed in RAM. Thus, computing diffs and refreshing files don't include any disk I/O, providing a really blazing fast live reload.

For development, instead of using the `webpack` command, rather use the following one to launch dev server:

``` sh
 ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --progress --colors
```
Replace your `script` tag by the following:

``` html
<script src="http://localhost:8080/public/helloWorld.js"></script>
```
Look at the console. It should display "Hello World". If we replace "World" by "John Doe" and simply save our file, we expect our console to be refreshed. Yet, nothing happens.

Webpack uses [Socket.io](http://socket.io/) to know when to refresh browser. We launched the Socket.io server, but didn't update our client script. Webpack eases our work with a pre-built module. Just modify your `entry` parameter:

``` js
module.exports = {
    entry: {
        helloWorld: [
            'webpack-dev-server/client?http://localhost:8080',
            './js/helloworld.js',
        ]
    }
    // ...
};
```

If we relaunch our dev server and refresh manually our browser, a Socket.io connection is then initialized. Switching `John Doe` to `Alice Brown` into our file now automatically reloads the page in the browser. Hurrah! Live-reload is working!

### Webpack dev server and production?

Of course, we won't deploy our dev server in production. One solution is to use an environment variable. Let's use `NODE_ENV` to check if we should embed the dev server client:

``` js
function getEntrySources(sources) {
    if (process.env.NODE_ENV !== 'production') {
        sources.push('webpack-dev-server/client?http://localhost:8080');
    }

    return sources;
}

module.exports = function() {
    entry: {
        helloWorld: getEntrySources([
            './js/helloworld.js'
        ])
    },
    // ...
}
```

Compiling for production would then looks like:

``` js
NODE_ENV=production ./node_modules/webpack/bin/webpack.js -p
```

Another issue is the script `src` attribute. In development, we should embed it as a dev server served resource (using `http://localhost:8080`). In production, it would either be served from a CDN, or directly from `public` folder. 

To differentiate these usages, I simply use a template variable. For instance, using Swig and Node.js:

``` js
var cdn = (process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8080/');

swig.setDefaults({
    locals: { // Global variables
        cdn: cdn
    }
})
```

``` xml
{% raw %}<script src="{{ cdn }}helloWorld.js"></script>{% endraw %}
```

## Webpack and React.js

I suppose in this part that you are already familiar with [React.js](https://facebook.github.io/react/). If not, please, go ahead to discover this amazing framework.

### Setting up a Basic "Hello World!" Application

Let's build a simple "Hello World!" application, allowing the user to enter their name.

First, install React.

``` sh
npm install --save-dev react
```

We install it as a dev dependency. Indeed, we won't use it directly in production, as it will be embedded into our compiled output.

Let's write our application, using the far less verbose JSX notation.

``` js
var React = require('react');

var HelloSayer = React.createClass({
    render: function() {
        return (<p>Hello {this.props.name}!</p>);
    }
});

module.exports = HelloSayer;
```

``` js
var HelloSayer = require('./HelloSayer');
var React = require('react');

var HelloForm = React.createClass({
    getInitialState: function() {
        return {
            name: 'world'
        };
    },

    render: function() {
        return (<div className="hello-form">
            <input type="text" onChange={this.onChange} />
            <HelloSayer name={this.state.name} />
        </div>);
    },

    onChange: function(e) {
        this.setState({
            name: e.target.value
        });
    }
});

module.exports = HelloForm;
```

``` js
var HelloForm = require('./HelloForm');
var React = require('react');

React.render(<HelloForm />, document.getElementsByTagName('body')[0]);
```

These are some basic React components. I won't cover this code as this is not the purpose of this post. Even if it should not work at this state, here is the final expected component for a better visualisation:

<div class="labs" id="react-hello-form"></div>
<script src="/labs/react-hello-form.js"></script>

### Transforming JSX on the fly

Even if you can use pure JavaScript, React is greatly simplified if you use JSX syntax, as above. Yet, JSX is understandable neither by browsers nor Webpack. So, to circumvent this issue, we have to transform JSX into pure JS **before** Webpack handles it.

The Webpack ecosystem has a lot of loaders available. A loader is simply a transformer, applied on all files matching a regular expression. So, implement a JSX loader to deal with our components:

``` sh
npm install --save-dev jsx-loader
```

Modify our configuration accordingly:

``` js
module.exports = function() {
    // ...
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'jsx',
                exclude: /node_modules/
            }
        ]
    }
    // ...  
};
```
So, all files whose path finish with `.js` will be transformed by `jsx-loader`, except those under `node_modules` folder (for performances reason). This time, Webpack should not complain and should display your widget correctly.

Note that you can omit the suffix `-loader` for the `loader` property. In above code, we may have replaced `jsx` by `jsx-loader`.

### Installing React Hot Loader

We already enabled live-reload. However, if you want to change the `HelloSayer` component, it will reload the whole page, losing the data you entered in the `input` field.

We can go a step further into our live-reload implementation, using [react-hot-loader](http://gaearon.github.io/react-hot-loader/). This tool reloads only the React component you changed. In our case, modifying the `HelloSayer` should have no impact on the input, which is outside its scope.

``` js
npm install --save-dev react-hot-loader
```

We have to tweak some of our `webpack.config.js` file. First, we have to embed a new watching script for React Hot Loader:

``` js
// webpack.config.js

function getEntrySources(sources) {
    if (process.env.NODE_ENV !== 'production') {
        // ...
        sources.push('webpack/hot/only-dev-server');
    }

    // ...
}
```
Then, we add the `react-hot` loader to our React component files (in this case, all the `.js` files):

``` js
// webpack.config.js

module.exports = {
    // ...
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: ['react-hot', 'jsx'], // <-- changed line
                exclude: /node_modules/
            }
        ]
    }
}
```
Now, you have to launch your `webpack-dev-server` with a `--hot` option to enable React Hot Reload:

``` sh
./node_modules/webpack-dev-server/bin/webpack-dev-server.js --hot --progress --colors
```
Because of some browser restrictions, we can't open our page with `file://` protocol anymore: we need a HTTP server. Let's use the simple no-configuration one: [http-server](https://github.com/indexzero/http-server).

``` sh
npm install --save-dev http-server
```

Running it is as simple as:

``` sh
./node_modules/http-server/bin/http-server -p 3000 .
```

We run our server on port 3000 and set the web root to current folder (this is `public` by default).

If we launch our application in current state, React Hot Loader would try to fetch its update on current host, ie on port 3000. As Webpack dev server is bound to port 8080, we have to force use of absolute URL, using the `publicPath` property:

``` js
module.exports = {
    // ...
    output: {
        publicPath: 'http://localhost:8080/', // <-- New line!
        filename: 'public/[name].js'
    }
    // ...
}
```
Relaunch your server, and admire!

## Webpack and ES6 using Babel

Let's prepare the future for our application using [EcmaScript6](https://github.com/lukehoban/es6features). ES6 is the new standard of JavaScript, embedding nice features, such as classes or template strings. Unfortunately, not all browsers are compatible with this language evolution: we have to transpile ES6 into good old ES5.

There are two main transpilers: Babel and Traceur. My [choice is made on Babel](http://www.jonathan-petitcolas.com/2015/03/09/transpiling-es6-to-es5-using-babel.html), so let's use it with Webpack. 

As usual, we use a loader:

``` sh
npm install --save babel-loader
```

Just add it to all your JS files, after the JSX loader, as Babel won't understand HTML tags into your JavaScript files:


``` js
module.exports = {
    // ...
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['react-hot', 'jsx', 'babel'], // <-- changed line
                exclude: /node_modules/
            }
        ]
    }
}
```
Be careful to your loaders order: they are applied from right to left. So, we first transpile our ES6 code, then we turn our ES5 JSX to pure JS, and then we watch for the hot reload.

Webpack now transpiles ES6 into ES5. Let's check it converting one of our component into ES6:

``` js
import React from 'react';

class HelloSayer extends React.Component {
    render() {
        return <p>Hello {this.props.name}!</p>;
    }
}

export default HelloSayer;
```

Our app still works. We are done! Dead simple isn't it?

## Compiling SASS with Webpack

Webpack is the Swiss-army knife of Web bundler. It can also handle SASS compilation for you. Let's see how it works.

### SASS, CSS, and style loaders

Let's create a very basic SASS file for our component:

``` css
.hello-form {
    p {
        color: blue;
    }
}
```

To compile SASS files, you need a SASS loader of course, but also a CSS and a style loaders. Indeed, Webpack understands only JS. Basically explained, when we write a `require('style.scss')`, SASS loader turns it into `style.css`, which should then be turned into JavaScript with CSS loader, and finally embedded as styles using the style loader.

``` sh
npm install --save-dev sass-loader css-loader style-loader
```

As usual, add a new loader into our configuration:

``` js
module.exports = {
    // ...
    module: {
        loaders: [
            // ...
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            }
        ]
    }
}
```

Now, if you include your SCSS file into your `HelloForm` JavaScript file:

``` js
require('../sass/HelloForm.scss');
```

Your style should be loaded. Some may find it really weird to include some SCSS into a JavaScript file. After playing several weeks with it, I must admit this is really nice. All your components are now better isolated, each one containing its own style and logic. Far better for maintainability and reuse.

#### Fixing uv__finish_close error

There is an issue with the current version of `sass-loader`:

>  build modulesnode: ../deps/uv/src/unix/core.c:199: uv__finish_close: Assertion `0' failed.

To fix it, just downgrade your `sass-loader` version to 0.5, editing your `package.json` file and redoing a new `npm install`.

### Move CSS in external stylesheet

Taking a closer look at the generated code, we may notice that styles are included using a `<style>` tag. That's a bad practice, as it prevents browsers from caching CSS. So, let's move it into a dedicated file.

We are going to use the `ExtractTextPlugin`, which moves the generated content into a file:

``` sh
npm install --save-dev extract-text-webpack-plugin
```

Then, update your config:

``` js
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    // ...
    module: {
        loaders: [
            // ...
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('public/style.css', {
            allChunks: true
        })
    ]
}
```
We first replace our `loaders` with a single `loader`, provided by the `ExtractTextPlugin`. We apply two filters to it, first `sass` then `css`. We removed the `style` one, as we don't want to embed styles directly in the page anymore.

Then, we effectively move the styles into `public/style.css`, embedding all the individual compiled chunks into a single file. 

Just include a `link` tag on your page, and your styles should still be here.

The whole project is available on GitHub: [jpetitcolas/webpack-react](https://github.com/jpetitcolas/webpack-react). Don't hesitate to browse through all commits, each one corresponding to a step of this post.
