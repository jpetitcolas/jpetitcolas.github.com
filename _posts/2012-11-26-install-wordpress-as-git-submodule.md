---
layout: post
title: Installing WordPress as a Git submodule
date: 2012-11-26
---

# {{ page.title }}

## Installing WordPress submodule

Updating a WordPress blog with all its plug-ins may be very time-consuming, especially for those who maintain several blogs. Fortunately, there is a solution to reduce maintenance time. Using Git, you will be able to update your blogs just by checking out the new tag of your WordPress submodule.

First, create a project and initialize it:

``` bash
mkdir blog
git init
```

Now, retrieve [WordPress Git repository](https://github.com/WordPress/WordPress) and add it as a submodule:

``` bash
git submodule add https://github.com/WordPress/WordPress wordpress
```

For stability reasons, it is recommended to stabilize submodules to tags or branches considered as stable. So, let's apply this best practice by fixing WordPress version to current one (3.4.2 when I wrote this post).

``` bash
cd wordpress
git fetch -a
git tag
git checkout 3.4.2
```

These lines simply go to the submodule repository to retrieve all remote tags (with `git fetch` command). Then, we display all available tags and fix the version to 3.4.2 with `checkout` command.

Commit your work before configuring WordPress to use this Git architecture:

``` bash
git commit -m "Install WordPress 3.4.2 as a submodule"
```

## Configuring WordPress to use Git submodule

Duplicate all files you will change to be able to commit them into your own repository (and not into WordPress core):

``` bash
cp wordpress/index.php index.php
cp wordpress/wp-config-sample.php wp-config.php
cp -Rf wordpress/wp-content .

rm -Rf wp-content/plugins/hello.php wp-content/themes/twentyten
```

The three first lines simply copy files we will modify. The last one cleans our repository, removing useless _hello_ plug-in and default _twentyten_ theme.

Commit these changes:

``` bash
git commit -am "Duplicate all non-core WordPress files"
```

Now, we have to tell WordPress to use our new structure: the submodule for all the core files, and the root `wp-content` folder for all other stuff.

First, let's edit the `index.php` file to indicate WordPress where the bootstrap file is. Replace line 17 by:

``` php
require('wordpress/wp-blog-header.php');
```

Then, edit your `wp-config.php` configuration file according to your own situation. Just follow the comments.

Yet, we will define in this file some constants to take the new structure into account. Add the following lines into this same file, **before** the `require_once(ABSPATH . 'wp-settings.php');` line (thanks to Marco Neumann for this precision):

``` php
define('WP_HOME',    'http://'.$_SERVER['SERVER_NAME']);
define('WP_SITEURL', WP_HOME.'/wordpress');

define('WP_CONTENT_DIR', $_SERVER['DOCUMENT_ROOT'].'/wp-content');
define('WP_CONTENT_URL', WP_HOME.'/wp-content');
```

Your blog should now be accessible. Do not forget to commit your changes:

``` bash
git commit -am "Configure WordPress to be used as a Git submodule"
```

If you want to connect to the administration panel, simply go to `wordpress/wp-admin` URL. Or, if you rather like to use standard access, simply create a symbolic link:

``` bash
ln -s wordpress/wp-admin .
```

## How to update WordPress as a submodule?

Here is the process to update easily your WordPress installation:

``` bash
cd wordpress
git fetch -a
git tag
git checkout 3.4.3
cd ..
git commit -am "Switch WordPress to 3.4.3 version"
```

It is the same we have seen before. It consists to fetch all recently created tags and branches, and to change current version.

It is equivalent for all the plug-ins and/or themes... at least, if they have a Git repository, which is not often the case. Pretty sad for open-source, isn't it? 
