---
layout: post
title: Optimizing JQuery performances
date: 2012-07-29
---

JQuery is one of the major Javascript framework. Indeed, it is easy to dive in, has great performances and a huge community. Yet, developers sometimes forget to optimize performances, relying only on framework internals. It is an issue, especially nowadays, when mobile traffic is so important.

That's why I am sharing with you a slideshow from [Addy Osmani](http://addyosmani.com/blog/), core-team member of JQuery. Addy gives some tips and tricks to increase overall speed of your scripts.

<div class="iframe">
  <iframe src="http://www.slideshare.net/slideshow/embed_code/8520572" frameborder="0" scrolling="no">  </iframe>
</div>

To put it in a nutshell, here are the key points:

* Always update your JQuery version: newest are fastest.
* Rather like to use `val()` instead of `attr("value")`.
* Use pure Javascript when you have no need of JQuery: it will always be faster.
* Do not forget DOM caching (and thus `delegate`, `find` and other such methods).
* Prefer to `append` strings instead of creating DOM element individually.
* Think to `detach` method when you have heavy computing to do on a DOM element.
* Forget `data` or `text` methods: use `$.data` or `$.text` instead of.

Very interesting tips, aren't they?
