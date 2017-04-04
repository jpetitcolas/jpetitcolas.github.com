---
layout: post
title: "Conditional Babel Configuration: Introducing Babel Env"
excerpt: "After being stuck for a few hours because of some Babel configuration issues in an isomorphic app, we finally discovered the Babel env property. It allows to apply some sort of conditional configuration, depending on a given environment variable."
tags:
    - Babel
    - Webpack
    - isomorphic

illustration: "/img/posts/babel.png"
illustration_title: "Babel, the compiler for writing next generation JavaScript"
illustration_link: "https://babeljs.io/"
---

We recently got stuck on an issue with Babel configuration inside an isomorphic React application. Our app includes some styles directly from JavaScript:

``` js
require('./MyComponent.scss');

export default ({ props }) => (/* ... */);
```

Using a module bundler such as Webpack, this code is perfectly working. The module bundler would convert the SCSS into plain JavaScript, and eventually inject it in a `style` element. However, we are working on an isomorphic application. And, as Node only understands JavaScript, executing our transpiled file without the SCSS to JS translation step, our code would result in following error:

```
/home/jpetitcolas/dev/my-project/MyComponent.scss:1
(function (exports, require, module, __filename, __dirname) { .my-component {
                                                              ^

SyntaxError: Unexpected token .
    at exports.runInThisContext (vm.js:53:16)
    at Module._compile (module.js:387:25)
    at Object.Module._extensions..js (module.js:422:10)
    [...]
```

Fortunately, the `babel-plugin-transform-require-ignore` plugin allows to ignore some `require` statements based on the extensions. Hence, to ignore all SCSS files from our transpilation, we just add the following to our `.babelrc` file:

``` json
{
    "plugins": [
        ["transform-require-ignore", {
            "extensions": [".scss"]
        }]
    ]
}
```

If we try to execute our transpiled file again, it should not raise any error anymore. Success? Not exactly: executing this code client-side now displays our component without any CSS. Indeed, the `.babelrc` configuration file is global to our project. Our module bundler also uses it, hence ignoring all style-related `require`.

My first thought was to find a way to override Babel configuration directly in CLI using the `--plugins` option:

``` sh
./node_modules/.bin/babel --plugins transform-require-ignore MyComponent.js
```

However, I didn't find how to pass an argument using CLI. It seems [it is currently not supported](https://github.com/babel/babel/issues/4344). Diving deeper into Babel documentation, I noticed an interesting feature: the [Babel env property](https://babeljs.io/docs/usage/babelrc/#env-option).

> You can use the env option to set specific options when in a certain environment. Options specific to a certain environment are merged into and overwrite non-env specific options.

So, we can apply a different configuration within a single `.babelrc` file, simply by using a `BABEL_ENV` environment variable. Looks like the perfect solution. And indeed, adding the following lines to the `.babelrc` file solved our issue:

``` js
{
    "env": {
        "node": {
            "plugins": [
                ["transform-require-ignore", {
                    "extensions": [".scss"]
                }]
            ]
        }
    },
    "presets": [/* ... */],
    "plugins": [/* ... */],
}
```

Now, by prefixing our transpilation command by `BABEL_ENV=node`, we were able to transpile our files without CSS for server. But as Webpack doesn't use the `BABEL_ENV` variable, it would then keep include our styles for client-side.
