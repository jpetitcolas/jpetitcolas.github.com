---
draft: true
---

## Introduction to PenTests: Reconnaissance from Target Website

So, at this point, I got only two pieces of information: company name and its CEO name. Let's consider his name is John Doe and he is owning its own Acme company. How original, I know! ;)

First step is to find their website. In order to do so, let's use Google:

```
Acme John Doe
```

As `Acme` is in reality a really common word, I had to narrow my search using the extra data I had: the CEO name. I naturally found their website this way: `www.acme.com`.

Before grabbing technical informations, let's read the content as a normal user, to check if we can gather some useful informations:

* Their CTO's name is `Dave Lopper` (thanks the "Our Team" page),
* They work for several big companies specific features, detailed on their blog,
* They use Trello, Slack and Skype (`to facilitate the flow of information, we use innovative collaborative tools such as...`),
* Their favorite technologies are Magento and Prestashop.

And that was the information I grabbed just reading the few pages of the website, as a normal user.

[WORD ABOUT JOBS OFFER]

Let's see if we can get more information opening the source code. Taking a look on the `body` tag, I noticed a `ng-app` tag. That's an Angular application. It explains especially why code source is so light. Everything is loaded on client side. Isomorphic rendering has not been planned apparently. Too sad for search engines (and for us too).

Going deeper in the source code, we can see:

``` html
 <!-- Javascripts: online mode [PROD] -->
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.min.js"></script>
<!-- //... -->
<script src="dist/scripts.min.js"></script>

<!-- Javascripts: online mode [DEV] -->
<!-- <script src="js/local/angular.min.js"></script>
<script src="dist/scripts.min.js"></script> -->
```

So, they are using Angular 1.6.4. And, far better, we have access to their development script, thanks to the `online mode [DEV]` block. Looking at Angular source code is not very exciting, and `scripts.min.js` is the same used in production. However, they seem to use source code present in the `js/local` folder, uploaded online. I tested, in vain, several URL to see if we can get some ready to exploit sources:

```
js/local/index.js
js/local/app.js
js/local/acme.js
js/local/acmeApp.js
```

With all the `*.min.js` and camel-cased variants. But only 404. So, let's see if the minified version can give us some details. Opening it returned a minified code. However, at the end of the file, we can read:

```
//# sourceMappingURL=maps/scripts.min.js.map
```

Testing reaching the map URL returns a 404. It seems it has not been uploaded. Well, let's see if we can extract some data from the minified JS version. First, we need to beautify the one line obfuscated code. There are plenty of tools for it. I used the online [JSBeautifier](http://jsbeautifier.org/).

I won't cover in details the 1000+ lines of code present in the unminified version. However, we get some template paths and the content of each Angular controllers. It allows us to extract one of the company email: `goodmorning@acme.com`. Far less intuitive than a simple `contact@acme.com` one, but still good to know.

Let's continue our reconnaissance using the `robots.txt` file. It is quite verbose:

```
User-Agent: *

Disallow: /css/
Disallow: /favicons/
Disallow: /fonts/
Disallow: /images/
Disallow: /js/
Disallow: /nginx.conf/
Disallow: /old-browser/
Disallow: /php/
Disallow: /sass/
Disallow: /seo/
Disallow: /templates/
Disallow: /translations/
Disallow: /views/

User-agent: Googlebot
Allow: /images/
Allow: /js/
Allow: /css/

User-agent: Googlebot-Mobile
Allow: /images/
Allow: /js/
Allow: /css/

User-agent: Googlebot-Image
Disallow: /
Allow: /images/john-17.jpg
Allow: /images/dave-1.jpg
```

I have no idea why somebody would expose the `nginx.conf` folder to the Internet, but that may ease our task later. Note also that webserver is using `nginx`. Testing a few URLs such as `/nginx.conf/default` or `/nginx.conf/acme` gave no results. There may be some site related extensions for that, perhaps a `.htaccess` like file? My knowledge of `nginx` is too limited at this step. And as this is just reconnaissance, not exploitation, let's keep it for later.

Testing the `/old-browser` URL returned a 403 (Forbidden) response. With the server footer `nginx/1.4.6 (Ubuntu)`. Interesting.

A `/php/` folder? Fine, we get the server side language now.

Trying different URLs in the `seo` or `translations` folder didn't give any successful result.

That's all the data I retrieved when exploring my website. To sum them up:

* CTO's name is `Dave Lopper`,
* They work for several companies, including the famous `FooBar Corp.`,
* They use Trello, Slack and Skype,
* They use PHP, Angular, Magento and Prestashop,
* Their website is powered by nginx 1.4.6 on Ubuntu.

