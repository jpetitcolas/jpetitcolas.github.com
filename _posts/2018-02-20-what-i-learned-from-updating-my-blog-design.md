---
layout: post
title: "What I Learned from Updating my Blog Design"
excerpt: "I have just updated my blog design to get a moderner look. Integrating it taught me several useful tips I am sharing with you."
tags:
    - design
    - CSS

illustration: "/img/posts/updating-design/new-design.png"
illustration_thumbnail: "/img/posts/updating-design/new-design-thumb.png"
illustration_title: ""
illustration_link: ""
---

I have just updated the design of this blog. The old one started to look too old-fashioned, and its organization annoyed me. Indeed, there was a separation between the talks I gave and the posts I wrote. Wishing to put more emphasis on my speaker career, I had to redesign this system. On the new one, no more distinctions: all talks would be (soon) embedded in the posts flow.

That's why I started this redesign. As my designer skills are far from being usable, I started looking for a theme for an essentially textual blog. And I found the [WordPress Baskerville theme](https://wordpress.org/themes/baskerville/), by [Anders Norén](http://www.andersnoren.se/). Using Jekyll for these few pages, I had to reintegrate the whole design. It allowed me, in addition to optimizing HTML semantics and removing all unused styles, to grab a few tricks that I am sharing with you today.

## A more Natural Vertical Flow with Masonry

### Introducing Masonry

First, the home page. If we resize our browser, we notice that every post automagically reposition itself at a correct place, whatever is the post card height.

![Masonry on Home Page](/img/posts/updating-design/home-masonry.gif)

All the magic is handled by [Masonry](https://masonry.desandro.com/), a cascading grid layout library, available in VanillaJS version. Using it is as simple as embedding the following script:

```js
new Masonry('.posts-list', {
    itemSelector: '.post',
});
```

We just need to set correct dimensions to your `.post` list item (in our case, only `width` is constrained), and we are ready to go!

To provide a lighter experience for my readers, I tried to remove Masonry dependency and to check the result, either by fixing height, or by using some `float` properties.

**Without any custom rule:**
![Default display of posts, without Masonry](/img/posts/updating-design/nothing.png)

Gap is irregular, with possibility of big holes in the grid.

**Fixed height:**
![Fixed height](/img/posts/updating-design/fixed-height.png)

No more hole in the grid. Yet, it requires to adapt writing to design to get a correct display. I don't want such cumbersome and time-consuming extra work.

**Floating posts:**
![Floating posts](/img/posts/updating-design/float-left.png)

Best solution of all, except there are some content holes in the grid.

After giving it a few tries, I've decided to let the extra 7.77 kB of JavaScript from Masonry lib.

### Handling Image Loading

I currently display all available posts on the home page. I will probably switch to an infinite scrolling like pagination in the future, but for now, it is fast enough. Yet, it raises an issue with Masonry.

I embed a picture per post card. I can't constraint image height on each post field, as no dimension is the same. So, post card height changes over time, once pictures are loaded. It causes an issue for Masonry, as we call it at the end of the page, without expecting every assets are loaded.

Often, all pictures are correctly loaded prior to Masonry initialization (at least on my laptop with a fast Internet connection). Yet, sometimes, loading images is slow, and we face the following glitch:

![Masonry Glitch sample](/img/posts/updating-design/masonry-glitch.png)

Indeed, Masonry computed each card position taking into account their height. However, an image has not yet loaded: post card is smaller than expected. Once the picture has loaded, position is no longer valid, and we need to relaunch a Masonry layout computation. This is easily verifiable: just resize the browser, and the glitch disappear.

We are obviously not the only one having the issue, so there should be an existing solution. And indeed, there is [imagesloaded](https://imagesloaded.desandro.com/). Just like its name says, this lib executes a function once all images are loaded. So, we can update our Masonry code to handle image loads:


```js
imagesLoaded('.posts-list .picture', function () {
    masonry.layout();
});
```

We wait that all `.posts-list .picture` images are correctly loaded, and we re-render the Masonry layout. Only four lines of code to get this natural flow... Amazing! I won't hesitate anymore before embedding Masonry in another project.

## Illustrating Blog

## Triangle Arrow with Pure CSS

## Subtle Image Effect with Scale Transition

## Responsive Cover Picture

## Jekyll Tips and Tricks

## Optimizing Social Network Share
