---
layout: post
title: Simulate readonly attribute on a select list
date: 2012-09-26
---

What is the difference between _readonly_ and _disabled_ HTML attributes? They both prevent a field from any change. Yet, the first sends the field value when the form is submitted. Not the second.

I discovered this morning that select lists do not accept _readonly_ attribute. It is written in the W3C specifications: [HTML/Element/Select/](http://www.w3.org/wiki/HTML/Elements/select). Until this is corrected, here is a JQuery way to simulate it:

``` javascript
/**
 * Simulate the read-only attribute on a select list (as it is not normalized).
 * @see http://www.w3.org/wiki/HTML/Elements/select
 * @param Object Select list element
 **/
function setReadOnlyOnSelect(selectList)
{
    // Ensure selectList exists
    if(!selectList.length) {
        console.warn("Unable to find specified select list.");
        return;
    }

    // Create a hidden input to store select value
    var input = $('<input />', {
        type: "hidden",
        name: selectList.attr("name"),
        value: selectList.val()
    });

    // Disable the select
    selectList.attr("disabled", true).before(input);
}
```

The trick here is to use a hidden field to store the select value we want to submit, while disabling the select list. Really simple, isn't it?
