---
layout: post
title: "Npm Tips and Tricks"
excerpt: "All Node.js developers have already used `npm` to install their favorite dependencies. However, far beyond the very famous `npm install`, npm offers a wide bench of available commands to ease our daily job. Most of them are unknown, so let's enlight them."
illustration: "/img/posts/npm-wombat-coding.png"
illustration_thumbnail: "/img/posts/npm-wombat-coding.png"
illustration_title: "Npm Coding Wombat found on Npm Blog"
illustration_link: "http://blog.npmjs.org/"
---

All Node.js developers have already used `npm` to install their favorite dependencies. However, far beyond the very famous `npm install`, npm offers a wide bench of available commands to ease our daily job. Most of them are unknown, so let's enlight them.

## Most basic command: install

The most famous command of `npm` is probably the `install` one. Following lines are two ways to install `lodash`:

```
npm install lodash
npm i lodash
```

Note the default alias at the second line. No need to write the whole `install` word, a single `i` is enough.

Yet, it won't save the dependency in our `package.json` file, and thus, our co-workers won't install `lodash` automatically at their next `npm install`. We can of course use the `--save` (or `--save-dev`) option, or be lazier and use their respective shortcuts: `-S` and `-D`:

```
npm install --save lodash
npm i -S lodash

npm install --save-dev lodash
npm i -D lodash
```

## Five Types of Dependencies

`npm` has five types of different dependencies, each of them having a given purpose.

**Production dependencies** (related to the `dependencies` property in `package.json`) are dependencies our project needs to work. For instance, we may find here `express` or `koa`.

**Development dependencies** (attached to the `devDependencies` property) are dependencies which are useful only to developers. They are not required in production. Typically, we find here all testing related libraries ([mocha](https://mochajs.org/), [sinon](http://sinonjs.org/), etc.) and module bundlers such as [Webpack](https://webpack.github.io/docs/) or [Gulp](http://gulpjs.com/).

**Peer dependencies** are a special kind of production dependencies. Declared as `peerDependencies` in the `package.json` file, they are dependencies required by the project in production, but not embedded directly in current module. For instance, in [ng-admin](https://github.com/marmelab/ng-admin), we have declared `angular` as a peer dependency. Indeed, this is a module for Angular, and we assume our final users would already have Angular configured in their own project. No need to duplicate source code.

**Optional dependencies** are another kind of dependencies stored in `optionalDependencies` property (we can install them using `--save-optional` flag). Imagine we want to give our users the ability to choose which rich text editor they can use. We can specify [tinyMCE](https://github.com/tinymce/tinymce) and [Quill](https://github.com/quilljs/quill) as optional dependencies. Then, in our code, just check which one is configured to embed features from one or the other:

``` js
const config = require('config');

if (config.rte === 'tinymce') {
    const tinymce = require('tinymce');
    // configure TinyMCE field
} else if (config.rte === 'quill'){
    const quill = require('quill');
    // configure Quill
}
```

Finally, the **Bundled Dependencies** (`bundledDependencies` property) is a particular type of dependencies. They behave like the normal production dependencies, except they are not installed from `npm`. This may be useful if we want to retrieve a private module without setting up a whole private repository. But, as we are using Git for all our projects, we can just use Git repositories instead.

## Using Git Repositories instead of npm Modules

Sometimes, we don't want to use `npm` modules directly. Either we are maintaining a private repository, or are waiting for a critical branch to be merged, we can simply use Git repository URL directly in our `package.json` file:

``` json
{
    "dependencies": {
        "angular-ui-codemirror": "git+ssh://git@github.com:jpetitcolas/ui-codemirror.git#di"
    }
}
```

We chose to use the `di` branch in previous example (the part after the final `#`). We may also have used a commit hash or a tag name.

If we are using GitHub, dependency URL may even be simplified to:

``` json
{
    "dependencies": {
        "angular-ui-codemirror": "jpetitcolas/ui-codemirror#di"
    }
}
```

## Cleaning Not Declared Modules

Sometimes, we may forget to include the `--save` or `--save-dev` option to our `npm install`, causing the *"but it works on my machine"* syndrom. To prevent it, just run a `prune` sometimes:

``` sh
npm prune
```

This command simply removes all dependencies that are not present in our `package.json` file. If we forget to save one of them, our project should not build anymore.

It may also be used in production. Imagine we are working on our deployment process, and that something broke. We are going to debug in production directly (even if we know it is bad). And we may sometimes make a standard `npm install` command instead of a `npm install --production` one. Not a big deal, but how can we clean up all unrequired development dependencies? Using the following command:

``` sh
npm prune --production
```

## Blazing Fast Docs Browsing

`npm` is shipped with two useful (yet quite unknown) commands: `npm home` and `npm repo`. These commands open respectively the project home page and project repository in our favorite web browser. This way, no need to google cumbersome `GitHub + [repository name]` anymore.

These two URLs are extracted from the `package.json` file. For instance, considering the [admin-on-rest](https://github.com/marmelab/admin-on-rest) repository:

``` js
{
  "homepage": "https://github.com/marmelab/admin-on-rest#readme",
  "repository": "marmelab/admin-on-rest",
}
```

## Fixing Versions during Installation

As you may have noticed during a failed production deployment, `npm` doesn't strictly fix our dependencies version at npm install. It just fixes the major version, leaving the minor one upgrading. It leads sometimes to several headaches, as JavaScript ecosystem is not really rigorous about [semver](http://semver.org/). We noticed it again when letting `jquery-ui` upgrade itself on one of our customer project:

<p class="center">
    <a href="/img/posts/jquery-version-issue.png">
        <img src="/img/posts/jquery-version-issue.png" alt="Please JavaScript library maintainers, respect semver!" title="Please JavaScript library maintainers, respect semver!" />
    </a>
</p>

To better understand how to prevent this kind of issue, let's check under the hood of npm versionning system.

### Tildes and Carrets

There are three ways to define a dependency version in our `package.json` file:

* Carret (`^`) is the most relaxed. It matches all major version, behaving like `1.*.*`.
* Tilde (`~`) is more strict, yet matching still the most recent minor version (`1.2.*`).
* Finally, nothing means the exact version (`1.2.3`).

Using fixed versions allows us to not spot minor regressions in production.

### Fixing Versions for New Dependencies

If we add new dependencies to our project and we want to fix version directly during installation, we'll use the `--save-exact` flag:

``` sh
npm install --save --save-exact <package_name>
```

Or, if we want to automatically save exact version without specifying this flag, we can configure our `npm` globally:

``` sh
npm config set save-exact true
```

But how about existing dependencies?

### Fixing Versions on an Existing Project

We may first think to simply remove carrets and tildes from our `package.json` file. It may work, but it also may break. Indeed, as explained above, loose dependencies update themselves automatically without updating the `package.json` file. Hence, a dependency may be at version `1.2.7` while our `package.json` still refers to `~1.2.0` version.

We need a more precise method to use real installed version. Getting the version of an installed dependency is as simple as:

``` sh
cat node_modules/<package_name>/package.json | grep version
```

Bash gurus may use esoteric command to retrieve version number. But, as I always forget how to write a simple `for` loop in Bash, let's use simple JavaScript instead:

``` js
const fs = require('fs');

// let's read our package.json file
const package = require('./package.json');
const dependencies = package.dependencies;

// do not mutate original dependencies
const updatedPackage = Object.assign({}, package);

['dependencies', 'devDependencies'].forEach(depType => {
    Object.keys(updatedPackage[depType]).forEach(dep => {
        // read package.json file to extract current version
        const fileContent = fs.readFileSync(`./node_modules/${dep}/package.json`, {
            encoding: 'utf-8',
        });
        const depPackage = JSON.parse(fileContent);

        // update version in memory dependencies tree
        updatedPackage[depType][dep] = depPackage.version;
    });

});

// update package.json content with updated versions
fs.writeFileSync(`./package.json`, JSON.stringify(updatedPackage, null, 4));
```
We take profit of JSON format of `package.json` to parse and manipulate it in pure JavaScript. Code should be self-explained. Note however the third argument of `JSON.stringify` on the last line, which allows us to beautify output JSON, using 4 spaces for indentation.

### Shrinkwrapping our Dependencies

We handled our dependencies the home-made way. However, there is a dedicated command to deal with them correctly:

```
npm shrinkwrap
```

This command creates a `npm-shrinkwrap.json` file, which is the equivalent of `composer.lock` in PHP. It contains a snapshot of currently installed dependencies. `npm install` takes this file in priority when installing dependencies.

It sounds like the perfect solution for our versionning issues. Yet, it has several drawbacks, making it sometimes unusable in production. Two main issues are the lack of Git dependencies support, and that it may be lossy and create not reproducible output. We encountered several issues using `shrinkwrap` and so decided to not use it anymore.

I didn't take a look on [Yarn](https://yarnpkg.com/), the `npm` alternative for now. But it promises to fix all these issues.

## Checking Outdated Dependencies

Packages regularly update, fixing some bugs, improving performances, or adding great new features. Yet, following every package evolution is an inhumane task. That's why `npm` offers the `outdated` feature:

``` sh
npm outdated

Package                 Current  Wanted  Latest  Location
babel-cli                6.14.0  6.16.0  6.18.0  admin-on-rest
babel-core              MISSING  6.17.0  6.18.2  admin-on-rest
babel-eslint              6.1.2   7.0.0   7.1.0  admin-on-rest
babel-preset-es2015      6.14.0  6.16.0  6.18.0  admin-on-rest
[...]
```

In a single glance, we have a map of all efforts we need to bring to be up-to-date. Generally, minor version are painless to upgrade. Updating all our dependencies on a regular basis (twice a month?) is a good practice. It would cost a few hours per month, but would be far cheapest than being forced to update a major version because of a production blocking issue.

## Automate Npm Init Parameters

Even if we don't initialize a new project every day, we can configure some parameters asked during `npm init` using the following commands:

```
npm config set init.author.name "Jonathan Petitcolas"
npm config set init.author.url "https://www.jonathan-petitcolas.com"
npm config set init.license "MIT"
```

## Updating Contributors List Automatically

We should always be grateful to all project contributors. They spend some time to contribute to our project, either by creating an issue or, even better, by submitting a pull request. We can thank them at least by respectively solving their issue, or adding them in the contributors list. Automating the first case is far beyond the scope of this post, so let's focus on the second one.

`package.json` file contains a `contributors` property as an array of developer names (and eventually email addresses). We may fill this field manually, gathering all commit authors from a `git log` list. But, we are developers, and prefer automatize cumbersome tasks. And so does [doowb](https://github.com/doowb) thanks to his `update-contributors` script (working only with GitHub).

Installing it is as simple as:

``` sh
npm install --save-dev update-contributors
```

Finally, we just have to call this freshly installed script to update our `package.json` file:

``` sh
./node_modules/.bin/update-contrib
```

And we are done! :)
