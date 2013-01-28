---
layout: post
title: "Redirect your URL without www to the one with www"
date: 2008-07-30
---

# {{ page.title }}

On some configuration, domain name without `www` does not always redirect to the one with `www`. This results in a bad SEO, as search engines will see two different websites because of the two different URL. So, they will consider your website _www.mysite.com_ as a duplicated content of _mysite.com_. 

Fortunately, there is an easy trick to prevent from such a disadvantage. Just set up a 301 redirect from the without www domain to the with www domain (or the opposite). You can do it by adding the following to your VHost (or to your _.htaccess_ file):

{% highlight bash %}
RewriteCond %{HTTP_HOST} ^mysite.com$
RewriteRule ^(.*) http://www.mysite.com/$1 [QSA,L,R=301]
{% endhighlight %}

The first line is a rewrite condition. It will execute the following rule only if the http hostname matches the regex `^mysite.com$`.

If so, we parse the URL for the query string through the regex `^(.*)`, and redirect to the hostname with _www_, followed by the captured query string. Three flags are present:

* *QSA (Query String Append):* keep all the `$_GET` specified parameters from the original request to the new one,
* *L (Last):* do not look for a more precise rule and just apply this one,
* *R=301 (301 redirect):* this is a permanent redirect. So, search engines, please update your indexes.

Pretty simple, isn't it?
