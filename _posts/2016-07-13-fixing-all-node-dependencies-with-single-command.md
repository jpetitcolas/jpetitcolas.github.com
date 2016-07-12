---
layout: post
title: Fixing All Your Project Node Dependencies in a Single Command
tags:
    - Node.js
    - Bash
---

I am currently working on a better integration of module bundlers on [ng-admin](https://github.com/marmelab/ng-admin),
an Angular.js powered admin panel to plug on REST APIs. My pull request is almost
done, but [@gildaspk](https://twitter.com/gildaspk) pointed me an issue with our
dependencies: they are not fixed.

## Understanding Node Package Versions

Here is an extract of ng-admin `package.json` before my pull request:

``` js
{
    "name": "ng-admin",
    // ...
    "devDependencies": {
        "admin-config": "^0.11.0",
        "angular": "~1.4.8",
        "angular-mocks": "~1.4.8",
        "angular-numeraljs": "^1.1.6",
        "angular-sanitize": "^1.3.15",
        "angular-translate": "^2.11.0",
        "angular-ui-bootstrap": "1.2.1",
        // ...
        "ui-select": "angular-ui/ui-select#271bf6a03078587c5afdb05f61e826573a13d348",
        // ...
    }
}
```
As you may notice, we didn't specify versions the same way on each line. Here are
the different possibilities:

* **Caret** matches any minor version. For instance, `^1.1.6` matches every `1.1.*` versions,
  but would never go on `1.2.0`.
* **Tilde** is a level higher. It matches all version keeping same major version (`1.*.*`).
* **No special characters** requires the exact specified version.
* **Commit Hash** fetches the exact GitHub commit (useful to apply a patched but not merged
    version on a third-party repository for instance)

## Why Should You Fix All Your Dependencies Versions?

`ng-admin` is a a project using a lot of dependencies (66 direct dependencies at
time of writing this post). Every project maintainer works hard to keep a correct
versioning, where minor version doesn't break any existing code. Yet, even if we
are really careful about any library update, it may happens we break backward
compatibility.

On an already bootstrapped project, we rarely do a full `npm install`, and often
keep all current dependencies versions, hiding bugs due to latest versions update.
However, what about a project new comer? It leads to frustration on both sides:
maintainer tries to find a non-existing bug (on their version) and project user
doesn't understand why it doesn't work.

So, for your project quality sake, we should fix all dependencies versions.

## Fixing Automatically All Your Dependencies Versions

Fixing all versions in your `package.json` file is not as trivial as it may seem,
especially if you have dozens of dependencies. My first thought was to simply update
my `package.json` file using each currently installed versions:

``` sh
# finding Angular.js version
grep version node_modules/angular/package.json

#   "version": "1.4.10",
```

Doing it for 66 dependencies is too cumbersome. So, let's try to automate it.

Using `npm list`, we can list every dependency of our project:

``` sh
npm list

ng-admin@1.0.0-alpha4 /home/jpetitcolas/dev/ng-admin
├── admin-config@0.11.0
├── angular@1.4.10
├── angular-mocks@1.4.10
├── angular-numeraljs@1.3.1
├── angular-sanitize@1.5.1
├── angular-translate@2.11.0
├── angular-ui-bootstrap@1.2.4
├── angular-ui-codemirror@0.3.0
├── angular-ui-router@0.2.18
├── angularjs@0.0.1
├─┬ babel@4.7.16
│ ├── acorn-babel@0.11.1-38
│ ├── ast-types@0.7.8
│ ├─┬ chalk@1.1.3
│ │ ├── ansi-styles@2.2.1
│ │ ├── escape-string-regexp@1.0.5
│ │ ├─┬ has-ansi@2.0.0
[...]
```
Yet, it also prints the dependencies of our dependencies. We don't need them, so
let's use the `--depth=0` option to get only direct dependencies:

``` sh
npm list --depth=0

ng-admin@1.0.0-alpha4 /home/jpetitcolas/dev/ng-admin
├── admin-config@0.11.0
├── angular@1.4.10
├── angular-mocks@1.4.10
├── angular-numeraljs@1.3.1
├── angular-sanitize@1.5.1
├── angular-translate@2.11.0
├── angular-ui-bootstrap@1.2.4
├── angular-ui-codemirror@0.3.0
├── angular-ui-router@0.2.18
├── angularjs@0.0.1
├── babel@4.7.16
[...]
```

Far better. Now, we have every version for every dependency. We may copy/paste it
into Atom and play with the multiple cursors feature to turn this tree into nice
looking JSON. But, as we like challenge, and as we would like to prevent from such
a boring task, let's go further playing with Bash:

``` sh
npm list --depth=0 \
    | head -n -1 \
    | awk 'NR>1' \
    | awk '{ split($2, a, "@"); print "    \"" a[1] "\": \"" a[2] "\"," }' \
    | xclip -selection clipboard
```

These lines looks forbidding, yet we just stack several Bash tricks together:

`head -n -1` removes the last empty line of `npm list` output, and `awk 'NR>1'`
removes the first line (number row greater than 1) containing the file name. So,
we filtered all lines to extract only the interesting ones.

The another `awk` is more difficult to read. First step, we retrieve the `$2` part
of each line, splitted by spaces. So, we get the `angular@1.4.10` part of the string.
We then split it at the `@` character, moving the splitted results into the `a` array.
Then, we simply add quotes to get a nice looking JSON.

Finally, we copy the output into the clipboard. This way, we just have to paste
to get fixed dependencies version set.
