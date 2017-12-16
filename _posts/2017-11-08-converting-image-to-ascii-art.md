---
layout: post
title: "Converting an Image into Ascii Art"
excerpt: "While browsing Stack Overflow, I generally browse one or two links from the sidebar 'Hot Network Questions'. It brings me to several interesting topics, not necessarily related to development. And this time, I found an interesting post: how do ASCII art image conversion algorithms work?"
tags:
    - canvas
    - HTML
    - fun

illustration: ""
illustration_title: ""
illustration_link: ""
---

While browsing Stack Overflow, I generally browse one or two links from the sidebar "Hot Network Questions". It brings me to several interesting topics, not necessarily related to development. And this time, I found an interesting post: [how do ASCII art image conversion algorithms work?](https://stackoverflow.com/questions/394882/how-do-ascii-art-image-conversion-algorithms-work)

ASCII art image conversion basically consists in two steps: converting our picture into gray colors, and map each pixel to a given character depending of the grayscale value. For instance, `@` is darker than `+`, which is also darker than `.`. So, let's try to implement such an algorithm in pure JavaScript.

For those in a hurry, you can test the converter directly in [final demo](#), or read its code source directly on its [GitHub repository](#).

## Uploading an Image into a Canvas

First step is to allow our user to upload a picture. Hence, we need a file input. Moreover, as we are going to manipulate image pixels, we also need a `canvas`.

``` xml
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Ascii Art Converter</title>
</head>
<body>
    <h1>Ascii Art Converter</h1>
    <p>
        <input type="file" name="picture" />
    </p>
    <canvas id="preview"></canvas>
</body>
</html>
```

At this step, we can send a picture to our input, yet nothing would happen. Indeed, we need to plug the file input to our `canvas` element. It is done using the `FileReader` API:

``` js
const canvas = document.getElementById('preview');
const fileInput = document.querySelector('input[type="file"');

const context = canvas.getContext('2d');

fileInput.onchange = (e) => {
    // just handling single file upload
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
        const image = new Image();
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;

            context.drawImage(image, 0, 0);
        }

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
};
```

On input change, we instantiate a new `FileReader` which would read the file, and once done, would load it into our `canvas`. Note we adapt the canvas size to the image one to not truncate it. The last two arguments of `drawImage` is the top left image margin: we want to start drawing our image from the top left corner (coordinates [0, 0]).

If we embed previous script on our HTML page, we would be able to display a preview of our picture into the `canvas` element:

<div class='embed-container'>
    <iframe src="/labs/ascii-art-converter/01/index.html" height="580" frameborder="0" allowfullscreen></iframe>
</div>

**Note:** if you want to snap a picture from your webcam, please refer to [Taking Picture From Webcam Using Canvas](https://www.jonathan-petitcolas.com/2016/08/24/taking-picture-from-webcam-using-canvas.html) post.

## Turning an Image into Grayscale

Now our image has been uploaded, we need to convert it into gray colors. Each pixel color can be broken into three distinct components: red, green, and blue values, as in hexadecimal (`#RRGGBB`) colors in CSS. Computing gray scale of a pixel is simply averaging these three values together.

However, human eye is not equally sensitive to these three colors. For instance, our eyes are very sensitive to green color, while blue is only slightly perceived. Hence, we need to ponderate each colors using different weights. After taking a look on the (very) detailed [Grayscale Wikipedia Page](https://en.wikipedia.org/wiki/Grayscale), we can compute the grayscale value using the following formula:

```
GrayScale = 0.21 R + 0.72 G + 0.07 B
```

So, we need to iterate on each of our picture pixel, extract its RGB components, and replace each component by its related grayscale value. Fortunately, working on a `canvas` allows us to manipulate each pixel using `getImageData` function.

``` js
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

const convertToGrayScales = (context, width, height) => {
    const imageData = context.getImageData(0, 0, width, height);

    const grayScales = [];

    for (let i = 0 ; i < imageData.data.length ; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const grayScale = toGrayScale(r, g, b);
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;

        grayScales.push(grayScale);
    }

    context.putImageData(imageData, 0, 0);

    return grayScales;
};
```
`convertToGrayScales` is quite straightforward, except for the `for` loop which requires some explanations. We retrieve each pixels in the `imageData.data` object. However, it is a uni-dimensional array, each pixel being splitted into its four components: red, green, blue, and alpha (for transparency). We retrieve the RGB value from the three first data cells, compute our grayscale, and then, move on of 4 indexes to go at the start of the next pixel components.

In this snippet, we modified the original image data, causing our function to be impure. Indeed, I wasn't able to find a way to update image data using a copy of our `imageData` variable.

Adding a call to `convertToGrayScales` function at the end of our `image.onload` listener, we should be able to upload a picture in gray colors:

<div class='embed-container'>
    <iframe src="/labs/ascii-art-converter/02/index.html" height="580" frameborder="0" allowfullscreen></iframe>
</div>

## Mapping the Pixels to GrayScale Values

## Final Demonstration
