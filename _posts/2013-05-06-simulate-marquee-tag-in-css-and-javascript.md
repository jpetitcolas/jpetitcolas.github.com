---
layout: post
title: "Simulate marquee tag in CSS and Javascript"
excerpt: "I am sometimes asked how to simulate `marquee` tag in full CSS. Even if it is deprecated, we can't always convince customers to not use such an accessibility disaster. Hence, here is a CSS alternative."
illustration: "/img/posts/marquee/marquee.png"
illustration_thumbnail: "/img/posts/marquee/marquee-thumbnail.png"
---

Several days ago, one of my following [asked on Twitter](https://twitter.com/Ornux/status/324451213171109888) how to simulate `marquee` tag in full CSS. For the youngest developers who may not know this strongly unadvised tag, it allows to slide a text from right to left. I know it is a deprecated one, because of a huge lack of accessibility. Yet, customers are always right. And, even if you try to convince them that it is a real disaster for readability and accessibility, some simply don't care. So, here is a CSS alternative.

First, the HTML:

{% highlight html %}
<p class="marquee">Do not use marquee tag for improve accessibility and readability.</p>
{% endhighlight %}

And now the related CSS:

{% highlight css %}
@keyframes marquee {
    0%   { text-indent: 430px }
    100% { text-indent: -485px }
}

@-webkit-keyframes marquee {
    0%   { text-indent: 430px }
    100% { text-indent: -485px }
}

.marquee {
    overflow: hidden;
    white-space: nowrap;
    animation: marquee 17s linear infinite;
    -webkit-animation: marquee 17s linear infinite;
}

.marquee:hover {
    -webkit-animation-play-state: paused;
    animation-play-state: paused;
}
{% endhighlight %}

This trick deals with a `text-indent` animation. I do not use a padding animation, to avoid some issues with border-box specifications. Here is a small schema to better explain the value I set:

<p class="center">
    <img src="/img/posts/marquee-limits.png" alt="Marquee limits" title="Marquee limits" />
</p>

As you may see below, this solution is fluider than the old `marquee` tag:

<iframe width="80%" height="150" src="/labs/marquee/marquee-01.html" frameborder="0" style="margin: 0 10%;"></iframe>

Moreover, there are two extra features with this solution:

* It's easy to **change sliding speed**: just modify the animation duration (here 17 seconds). However, the animation speed will not be the same across all browsers (Firefox is slower than Chrome for instance).
* You can **pause the sliding** when hovering for instance, simply by changing the animation state.

However, previous solution has a major issue: it requires to specify hard-written text indentation extremes. We are going to use some Javascript to change keyframe values on the fly:

{% highlight javascript %}
function getStringWidth(str) {

    var span = document.createElement("span");
    span.innerText = str;
    span.style.visibility = "hidden";

    var body = document.getElementsByTagName("body")[0];
    body.appendChild(span);
    var textWidth = span.offsetWidth;
    body.removeChild(span);

    return textWidth;
}

function getAnimationRule(animationName) {
    var KEYFRAME_RULE = window.CSSRule.WEBKIT_KEYFRAMES_RULE ||
        window.CSSRule.MOZ_KEYFRAMES_RULE ||
        window.CSSRule.KEYFRAMES_RULE;

    var stylesheets = document.styleSheets;
    for (var i = 0 ; i < stylesheets.length ; i++) {
        var rules = stylesheets[i].cssRules;
        for (var j = 0 ; j < rules.length ; j++) {
            var rule = rules[j];
            if (rule.type == KEYFRAME_RULE && rule.name == "marquee") {
                return rule;
            }
        }
    }
}

function updateMarqueeAmplitude(element) {

    var animationName = "marquee";
    var marqueeRule = getAnimationRule(animationName);
    if (null == marqueeRule) {
        return;
    }

    // remove the old animation (if any)
    element.style.webkitAnimationName = "none";

    var textWidth = getStringWidth(element.innerText);

    // update the values of our keyframe animation
    marqueeRule.deleteRule("0%");
    marqueeRule.deleteRule("100%");
    marqueeRule.insertRule('0% { text-indent: ' + element.offsetWidth + 'px; }');
    marqueeRule.insertRule('100% { text-indent: ' + -textWidth + 'px; }');

    // re-assign the animation (to make it run)
    element.style.webkitAnimationName = animationName;
}

updateMarqueeAmplitude(document.querySelector(".marquee"));
{% endhighlight %}

The first function `getStringWidth` is straightforward: we calculate the length in pixel of a string by hiding it into the DOM. It is a far more reliable way to measure it than to use string length and font size.

The second one, `getAnimationRule` is far more interesting. This method browses the CSS-OM (the equivalent of DOM for stylesheets) to retrieve animation keyframes declaration.

Finally, `updateMarqueeAmplitude`. This is the main function of our script. We retrieve the animation, we stop it by changing its name, and then we update the keyframe rules before restarting it.

Here is the related result:

<iframe width="100%" height="60" src="/labs/marquee/marquee-02.html" frameborder="0"></iframe>

What about performances? As you may have guess, the bottleneck of this application is in the `getAnimationRule` function. The more stylesheets and declaration you have, the more resource you will consume to retrieve the rule. It is a major issue, especially if you use some big frameworks such as Twitter Bootstrap.

That's why I do not recommend to use this script to get the extreme values of `text-indent`. Here are three ways to avoid this bottleneck:

* If your text is always the same, just use hard-written values.
* If you text is dynamic (generated from database for instance), pre-generate the stylesheet server-side with correct values.
* If neither of two previous solutions satisfy you, just use a separate stylesheet for your marquee animation and modify the `getAnimationRule` to parse only the marquee stylesheet.

&nbsp;
