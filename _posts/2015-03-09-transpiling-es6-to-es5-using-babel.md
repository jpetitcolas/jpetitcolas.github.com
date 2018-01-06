---
layout: post
title: "Transpiling EcmaScript6 code to ES5 using Babel"
excerpt: "During more than a week, we worked hard to introduce some EcmaScript6, the future of JavaScript, to ng-admin. Here is how we transpiled our code to ES5, to ensure every browser understands our code."
illustration: "/img/posts/babel/babel.png"
illustration_thumbnail: "/img/posts/babel/babel.png"
---

If you also watch [marmelab blog](http://marmelab.com/en/), you have probably already heard of [ng-admin](https://github.com/marmelab/ng-admin), the REST-based admin panel powered by Angular.js. Developed in good old EcmaScript5 JavaScript, it was time to make a step forward, introducing ES6 and its wide set of new features (a post on it soon).

We, at marmelab, spent the last two weeks updating the ng-admin configuration classes to ES6. We voluntarily restricted the perimeter to do the spadework for this new JavaScript version. And, as admin configuration is independent of Angular.js, that's the perfect target for our experiment.

As always in web development, we can't use a new technology, no matter how exciting, directly out of the box. To ensure browser compatibility, we need to transpile it into more common JavaScript. So, even if we write our code in ES6, we have to include a phase of transpiling, to convert it into pure ES5 code, understandable by all browsers.

## Babel vs Traceur

There are two main ES6 to ES5 transpilers: [Babel](http://babeljs.io/) (formerly known as 6to5) and [Traceur](https://github.com/google/traceur-compiler). We had to take one of them: Babel.

The main reason we chose Babel is it doesn't need any runtime extra script to run. Everything is done server-side. You just have to execute a compilation task once, and then deploy the compiled sources. At the opposite, Traceur needs to embed such a script, bringing an extra overhead. Yet, it should be nuanced, as we still need a polyfill ([core-js](https://github.com/zloirock/core-js)) for some missing browser methods, like `Array.from`.

Another issue is that Traceur is not compliant with [React.js](http://facebook.github.io/react/). This is not a big deal in this case, but as we also use the Facebook framework at marmelab, let's accumulate knowledge on a single technology. He who can do more can do less.

And, icing on the cake, Babel has an [online REPL](https://babeljs.io/repl/) if you want to quickly give it a try.

## How to use Babel to transpile your code?

### Turning your ES6 code to ES5 JavaScript

First, you need to install Babel:

``` sh
npm install babel --save-dev
```

Then, let's consider the following simple class:

``` js
class View {
	constructor(name) {
		this._name = name;
	}

	name(name) {
		if (!arguments.length) return this._name;
		this._name = name;
		return this;
	}
}

export default View;
```

Compiling it into pure ES5 JavaScript is as simple as the following command:

``` sh
babel View.js
```

By default it will output the file in standard output. You can of course redirect it to a file using the standard `>` operator.

``` sh
babel View.js > build/View.js
```

### Babel modules

Previous example had no dependencies. Yet, what would happen if we had to import another class? Let's experiment it right now:

``` js
import View from "./View";

class ListView extends View {
	constructor(name) {
		super(name);
		this._type = "ListView";
	}
}
```

Compile these two classes using the commands:

``` sh
babel View.js > build/View.js
babel ListView.js > build/ListView.js
```

If you open the `build/ListView.js` file, you will see some calls to `require` function:

``` js
var View = _interopRequire(require("./View"));
```

On ng-admin, we use [requirejs](http://requirejs.org/) to load our dependencies. So, I first thought I just had to embed `requirejs` and that everything would work out of the box. Unfortunately, after several hours of debug, I learnt it wasn't the case. Indeed, this `require` call is not the same than the `require` from `requirejs`. While the first is related to CommonJS, `requirejs` uses the AMD standard.

#### AMD? CommonJS? UMD?

I have always been confused about all these standards. I took profit of this project to clarify them. After digging the topic, it is simple.

All of these standards aimed to simplify development of modular JavaScript. Asynchronous Module Definition (AMD) is the `requirejs` module loader. It targets browsers only, and is supposed to simplify front-end development (even if I hardly found any more difficult to configure library).

AMD modules are defined through the `define` function, such as:

``` js
define(['dependencyA', 'dependencyB', function(dependencyA, dependencyB) {
	return {
		doSomething: dependencyA.foo() + dependencyB.foo();
	}
});
```

CommonJS is based on the Node.js module definition. This is not compatible with `requirejs`, but has been brought to front developers thanks to libraries such as `browserify` or `webpack`. Our previously AMD module would looks like the following in CommonJS:

``` js
var dependencyA = require('dependencyA');
var dependencyB = require('dependencyB');

module.exports = {
	doSomething: dependencyA.foo() + dependencyB.foo()
};
```
Finally, as neither AMD nor CommonJS succeeded in standing out from the crowd, another attempt of standardization emerged: Universal Module Definition (UMD). It has been built to be compatible with both of them.

``` js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['dependencyA', 'dependencyB'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('dependencyA'), require('dependencyB'));
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.dependencyA, root.dependencyB);
    }
}(this, function (dependencyA, dependencyB) {
    doSomething: dependencyA.foo() + dependencyB.foo()
}));
```
Really ugly and verbose, isn't it?

#### Using Babel with requirejs

So, we need AMD to be able to use `requirejs` with Babel. Yet, Babel exports by default to the CommonJS format. Fortunately, we can specify it a `--modules` option:

``` sh
babel --modules amd ListView.js
```

Checking generated output shows that we are now compliant with `requirejs`:

``` js
define(["exports", "module", "./View"], function (exports, module, _View) {
	// ...
});
```

## Testing with Babel

ng-admin uses two testing framework: Karma and Mocha. Here is how to configure these frameworks.

### Karma

For Karma, we just have to install an extra package:

``` sh
npm install --save-dev karma-babel-preprocessor
```

Then, update your `karma.conf.js` configuration file:

``` json
config.set({
	// ...
    plugins: [/* ... */ 'karma-babel-preprocessor'],
    preprocessors: {
        'ng-admin/es6/lib/**/*.js': 'babel'
    },
    babelPreprocessor: {
        options: {
            modules: "amd"
        }
    }
});
```

We add the freshly installed plug-in, specifying it to transpile to AMD module. We also have to specify which files should be transpiled, via the `preprocessors` option.

### Mocha

For Mocha, install process is similar and requires the `mocha-traceur` plugin:

``` sh
npm install --save-dev mocha-traceur grunt-mocha-test
```
We also installed the `grunt-mocha-test` as we are using Grunt. Then, a little bit of configuration:

``` js
// Gruntfile.js
grunt.initConfig({
	mochaTest: {
		test: {
			options: {
				require: 'mocha-traceur'
			},
			src: ['src/javascripts/ng-admin/es6/tests/**/*.js']
		}
	}
});

grunt.loadNpmTasks('grunt-mocha-test'); // enable "grunt mochaTest" command
```
If you prefer using mocha directly, just specify the `compilers` option:

``` sh
mocha --compilers js:mocha-traceur --recursive src/javascripts/ng-admin/es6/tests/
```
Now you got the big picture on how we succeeded to rewrite ng-admin configuration classes using EcmaScript6. There is still a lot of work to do on ng-admin for a full migration. Don't hesitate to [give a helping hand](https://github.com/marmelab/ng-admin)!
