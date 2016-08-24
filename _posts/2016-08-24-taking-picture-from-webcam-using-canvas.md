---
layout: post
title: "Taking Picture From Webcam Using Canvas"
illustration: "/img/posts/webcam.jpg"
illustration_title: "Webcam, by David Burillo"
illustration_link: "https://www.flickr.com/photos/dgbury/5695679595/in/photolist-9FiR7k-98et2a-98etvR-98hBZ9-6Ed5wT-ohM1Ua-9AMe8t-99gMt-4EtoSE-91enR6-aCLhA-71vCP-93Mxqn-59WYvo-71vAt-3mwzw-7DapU-7NDuqJ-aceHr-6cGRyB-4QK9Ed-4SFKp-33532-R93tf-9AcPZV-6KuEf-o1NMBf-551kGR-oxedo5-ozefa5-ohLnLV-ohL95C-ohL96E-ohL94A-oxedno-ozg5uc-miKhC-4QK9DY-moxg4g-62xZ8c-8gpDB-TY7Ry-vRtD4-5QzXBV-8zNSb-5QEdXL-9muvC-4iLMqg-dtKJqc-e1gAy3"
---

**Notice:** this post may ask your authorization to use your webcam. This is due to
live samples embedded in this post.

I recently needed to take a picture from a web browser using webcam. As this is
a basic need, I thought it would be quite easy. Yet, solution is not trivial, and
implies both using new user media HTML5 API and some canvas manipulation. Here is
a reminder which may be useful to everyone.

## Displaying Webcam Stream in Browser

First step is to display the webcam stream into the browser. It is easily done using
the `getUserMedia` HTML5 API. [Support is quite limited](http://caniuse.com/#search=getUserMedia)
(neither supported on Safari / iOS, nor on IE, but supported on Edge, Firefox and
Chrome). A solution for oldest browsers is to fallback on a Flash solution. However,
it won't be fixed on mobiles, and we would need to use an extra framework such
as [PhoneGap](http://phonegap.com/) in this case.

As dealing with fallback would be quite cumbersome, and as we don't want to write
some ugly prefixed code such as:

``` js
const getUserMedia = navigator.getUserMedia
  || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia
  || navigator.msGetUserMedia;
```

We are going to use a polyfill written by [@addyosmani](https://www.twitter.com/addyosmani):
[getUserMedia.js](https://github.com/addyosmani/getUserMedia.js/). It uses either the
native implementation or Flash fallback depending of browser support. Exactly what
we need.

First, let's install it (I'm using Webpack, hence the `save-dev`):

``` sh
npm install --save-dev getusermedia-js
```

Let's now initialize a video stream and display it in the browser using the
freshly installed package:

``` js
import { getUserMedia } from 'getusermedia-js';

getUserMedia({
  video: true,
  audio: false,
  width: 640,
  height: 480,
  el: 'stream', // render live video in #stream
  swffile: require('getusermedia-js/dist/fallback/jscam_canvas_only.swf'),
}, stream => {
    const video = document.querySelector('#stream video');
    video.src = window.URL.createObjectURL(stream);
    video.play();
}, err => console.error(err));
```

We start by calling the `getUserMedia` polyfill, specifying it we don't care about
audio, the preview video dimensions, and where to insert it (in the `#stream` element).
We also specify the path to our Flash fallback (included in the lib). I didn't test
it as all my installed browsers support this feature, but it should work this way.

Note that if we don't use any module bundler, we need to replace the `require` call
by the path of the fallback.

Second and third arguments are respectively success and error callbacks. Let's focus
on the success handler, as we just log errors in case of failure. Once we get the webcam
stream, we point the `video` tag to its URL, retrieved using the `URL.createObjectURL`
method. We should not forget to call the `play` method on our video to prevent
from being stuck at the first frame.

At this step, we are able to display our webcam stream:

<div class='embed-container' style="padding-bottom: 35rem;">
    <iframe src="https://www.jonathan-petitcolas.com/labs/webcam-picture/webcam-stream" height="580" frameborder="0" allowfullscreen></iframe>
</div>

## Taking a Picture using Canvas and Live Webcam Stream

Now, we need to isolate a single frame into a picture. Principle is not trivial: we need
to add a `canvas` element to our page, set the canvas content to current video frame,
and then convert canvas content to data URL.

We update our HTML code to add a `Capture` button:

``` xml
<div class="wrapper">
    <div id="stream"></div>
    <img id="grid" src="#"/>
    <p class="actions"><button id="capture">Capture</button></p>
</div>
```
We added an image used to display our snapped view once user has pressed the
capture button. As we don't have any image at initialization, we set the `src`
attribute to `#`. There is a lot of discussion about [how to set an image with no
src attribute](http://stackoverflow.com/questions/5775469/whats-the-valid-way-to-include-an-image-with-no-src/28077004#28077004).
I opted for the anchor `#` which triggers an extra request to current page, which
have been just downloaded and is still in cache. A very little overhead.

Browsers may display a broken image icon using `#`. To prevent this behavior, let's
use some CSS:

``` css
img[src="#"] {
    display: none;
}
```

Let's update our Javascript code to capture a single video frame:

``` js
const startVideo = stream => {
    const video = document.querySelector('#stream video');
    video.src = window.URL.createObjectURL(stream);
    video.play();
};

const stopVideo = stream => {
    const video = document.querySelector('#stream video');
    video.parentNode.removeChild(video);

    // free memory before page unloading
    window.URL.revokeObjectURL(stream);
}

const capture = () => {
    // add canvas element
    const canvas = document.createElement('canvas');
    document.querySelector('body').appendChild(canvas);

    // set canvas dimensions to video ones to not truncate picture
    const videoElement = document.querySelector('#stream video');
    canvas.width = videoElement.width;
    canvas.height = videoElement.height;

    // copy full video frame into the canvas
    canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.width, videoElement.height);

    // get image data URL and remove canvas
    const snapshot = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);

    // update grid picture source
    document.querySelector('#grid').setAttribute('src', snapshot);
};

getUserMedia({
  video: true,
  audio: false,
  width: 640,
  height: 480,
  el: 'stream', // render live video in #stream
  swffile: require('getusermedia-js/dist/fallback/jscam_canvas_only.swf'),
}, stream => {
    startVideo(stream);
    document.getElementById('capture').addEventListener('click', () => {
        capture();
        stopVideo(stream);
    });
}, err => console.error(err));
```

We moved previous success callback content into a dedicated `startVideo` function,
and add an event listener on the `capture` button. All other code is either self
explained or commented.

Note the `revokeObjectURL` call to prevent from some memory leaks, as explained on
[Mozilla documentation](https://developer.mozilla.org/en/docs/Web/API/URL/createObjectURL):

> Each time you call createObjectURL(), a new object URL is created, even if you've already created one for the same object. Each of these must be released by calling URL.revokeObjectURL() when you no longer need them. Browsers will release these automatically when the document is unloaded; however, for optimal performance and memory usage, if there are safe times when you can explicitly unload them, you should do so.

Now, we can take a picture from our webcam, getting its content via a data URL.
Here is the result of previous code:

<div class='embed-container' style="padding-bottom: 41rem;">
    <iframe src="https://www.jonathan-petitcolas.com/labs/webcam-picture/capture-button" height="580" frameborder="0" allowfullscreen></iframe>
</div>

In case we need to save the image server-side, we just need to send the `canvas.toDataUrl()`
result using AJAX for instance.
