---
layout: post
title: "Using HTTPs with Custom Domain Name on GitHub Pages"
excerpt: "GitHub supports HTTPs natively, but only for <code>github.io</code> domain names. It doesn't work with custom domain names. Fortunately, CloudFlare,
a free (for basic needs) DNS/CDN, provides a solution to use HTTPs any domain. Here is a step-by-step tutorial to secure your own GitHub Pages."
illustration: "/img/posts/octocat.png"
illustration_thumbnail: "/img/posts/octocat.png"
illustration_title: "GutHub Octocat, by Side-7"
illustration_link: "http://www.deviantart.com/art/GutHub-Octocat-215728549"
---

When writing my post about [taking a screenshot with Webcam](/2016/08/24/taking-picture-from-webcam-using-canvas.html),
I encountered some issues when embedding iframes using `getUserMedia` API. Indeed,
some `Mixed Content` warnings were triggered and code was not executed. This is
because both this blog was served in HTTP. Using HTTPs solves this issue.

It is a long time since I wanted to migrate my GitHub Pages blog to HTTPs. Indeed,
using this protocol has a lot of advantages:

* [Provide a more secured channel between your browser and visited website](http://mashable.com/2011/05/31/https-web-security/#_T6j.XTyGsqG),
* [HTTPs is faster than HTTP (thanks to SPDY)](https://samrueby.com/2015/01/26/why-is-https-faster-than-http/),
* [HTTPS is a SEO ranking signal](https://webmasters.googleblog.com/2014/08/https-as-ranking-signal.html).

GitHub supports HTTPs natively, but only for `github.io` domain names. It doesn't
work with custom domain names. Fortunately, [CloudFlare](https://www.cloudflare.com),
a free (for basic needs) DNS/CDN, provides a solution to use HTTPs with a custom domain
name.

## Configuring GitHub Pages

First step is to configure your [GitHub](https://www.github.com) repository. Go on the `Settings` page, and
let's ensure our repository uses a custom domain name and don't use HTTPs (both options
are incompatible):

<img style="box-shadow: none;" src="/img/posts/jonathan-petitcolas-github-config.png" alt="jonathan-petitcolas.com GitHub configuration" title="jonathan-petitcolas.com GitHub configuration" />

We are now done with GitHub configuration.

## Configuring CloudFlare

### Migrating our DNS Server to CloudFlare

Let's go on [CloudFlare](https://www.cloudflare.com/) to setup a new site, using
our custom domain name. At the end of the wizard, we need to update our domain name
settings to use CloudFlare DNS instead of your current ones. They will then
import all our existing configuration on their server.

Just ensure that `www` CNAME record redirects to your GitHub pages URL. `CNAME` is
just an alias. In this case, we tell DNS to respond address of `jpetitcolas.github.io`
whenever `www.jonathan-petitcolas.com` is queried.

<img style="box-shadow: none;" src="/img/posts/jonathan-petitcolas-dns-config.png" alt="jonathan-petitcolas.com DNS configuration" title="jonathan-petitcolas.com DNS configuration" />

### Forcing HTTPs on our GitHub Pages

Now that CloudFlare handles our DNS, we need to force all requests to use HTTPs.
On the *Crypto* tab, just change the `SSL` option to `Full`. To better understand
each of these options, here is a picture taken from [CloudFlare blog](https://blog.cloudflare.com/secure-and-fast-github-pages-with-cloudflare/):

<img style="box-shadow: none;" src="/img/posts/cloudflare-ssl-modes.png" alt="CloudFlare SSL Modes" title="CloudFlare SSL Modes" />

Using flexible SSL, all communications between CloudFlare servers and GitHub ones
are not encrypted. Not really secured, even if your domain would be served
in HTTPs.

However, full modes encrypt all communication streams, even behind CloudFlare servers.
In this case, hosting server needs to supports SSL. We need to stay in loose mode, as
GitHub won't validate the SSL certificate with a custom domain name.

Our site is now (depending of DNS propagation time, up to 48 hours) served in HTTPs
and is compatible with faster HTTP/2.

### Force Redirection to HTTPs Version

Currently, we can access our website on both `http` and `https` protocols. Yet,
for duplicate content issues, and for visitor's sake, let's use `https` (and `https` only)
for everyone.

We are going to add three rules for our domain (fortunately, we have three rules
with the free plan):

<img style="box-shadow: none;" src="/img/posts/jonathan-petitcolas-rules-config.png" alt="jonathan-petitcolas.com CloudFlare Page Rules" title="jonathan-petitcolas.com CloudFlare Page Rules" />

* First one enables caching on all URL,
* Second one redirect permanently URL without `www` to the one with `www`,
* Last one force use of `https` everywhere.

As a result, if we go on [http://jonathan-petitcolas.com/2016/...](http://jonathan-petitcolas.com/2016/09/05/using-https-with-custom-domain-name-on-github-pages.html),
we will be redirected to a cached version of  [https://www.jonathan-petitcolas.com/2016/...](https://www.jonathan-petitcolas.com/2016/09/05/using-https-with-custom-domain-name-on-github-pages.html).

Note the use of the wildcard `*` on all rules to match every URL. You can retrieve
the value replaced by the wildcard using the regex-like [`$1`, `$2`, ...] arguments.

### About CloudFlare Caching

CloudFlare is also a CDN (Content Delivery Network). It has a lot of servers around
the world and optimizes the way it delivers our data. To take profit of it, we just
had to enable caching using page rules. We can configure it more finely via
the `Caching` tab.

We cache every requests to GitHub for 4 hours (by default). Instead, all our requests
would be served by closest CloudFlare CDN server, saving fractions of seconds of
international data transit. Our static website is already blazing fast, let's increase
again its reactivity.

As we asked for a total cache, we need to purge cached pages at each change. We can
either do it using CloudFlare built-in API, or manually. As I don't publish several
posts a day, I can wait a few hours before seeing my post being publicly available.
Or I just purge the cache using CloudFlare user interface.

<img style="box-shadow: none;" src="/img/posts/cloudflare-purge-cachea.png" alt="Purging CloudFlare Cache" title="Purging CloudFlare Cache" />

Note there is also a `Development Mode` feature. It simply disables the cache layer,
allowing you to check in realtime all your changes. It is especially useful if you
need to debug in production. But nobody does this kind of thing, right? ;)

## Updating Disqus Comments

So, our GitHub Pages are now served under HTTPs using a CDN for better performances.
Yet, all our [Disqus](https://disqus.com/) comments have disappeared. Disqus is a
comment system provider pluggable on any websites, including the static ones. It saves
comments according to page URL (at least without any specific configuration). As we
switched from `http` to `https`, URLs are not the same, and we lost all our comments.

Fortunately, Disqus provides a way to deal with URL changes, using their [Url Mapper](https://help.disqus.com/customer/portal/articles/912757-url-mapper). First, go
on [Migrate Threads page](https://www.disqus.com/admin/discussions/migrate/) and click on "Start Url Mapper"
button. Then click on the "download a CSV here" link. We now have to wait a few minutes,
time for a download link to be sent to our email.

Once downloaded, let's open it in our spreadsheet software. We may use `awk`, but that's
too geeky, so let's be pragmatic. ;)

``` sh
cd ~/Downloads
gunzip jonathanpetitcolas-2016-11-08T07-05-36.582361-links.csv.gz

# open it in your spreadsheet software
gnome-open jonathanpetitcolas-2016-11-08T07-05-36.582361-links.csv
```

Then, we just need to replace `http://` by `https://` using the following formula
(on LibreOffice):

```
=SUBSTITUTE(A1,"http://", "https://")
```

Save your file, and submit it to the [Url Mapper](https://help.disqus.com/customer/portal/articles/912757-url-mapper).
Check your changes, and start migration. All your previous comments should soon be back on your website.
