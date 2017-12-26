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

While browsing Stack Overflow, I generally click on one or two links from the sidebar "Hot Network Questions". It brings me to several interesting topics, not necessarily related to development. And this time, I found an interesting post: [how do ASCII art image conversion algorithms work?](https://stackoverflow.com/questions/394882/how-do-ascii-art-image-conversion-algorithms-work)

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

Now that we have a list of grayscales value for every pixel, we can map each of these value to a different character. Reasons behind this mapping is simple: some characters are darker than others. For instance, `@` is darker than `.`, which occupies less space on screen.

The following character ramp is generally used for this conversion:

```
$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'.&nbsp;
```

Hence, mapping a gray scale value to its equivalent character can be done via:

``` js
const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const rampLength = grayRamp.length;

const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];
```

We retrieve the corresponding character using a cross-shaped product: gray scale of 0 (black) should be `$`, and a white pixel (gray scale of 255) should be a space ` `. We substract 1 to `rampLength` as arrays start at 0 index.

Let's translate our input image into pure characters:

``` js
const asciiImage = document.querySelector('pre#ascii');

const drawAscii = (grayScales) => {
    const ascii = grayScales.reduce((asciiImage, grayScale) => {
        return asciiImage + getCharacterForGrayScale(grayScale);
    }, '');

    asciiImage.textContent = ascii;
};
```

We have added a `pre` tag in our code with "ascii" id. `pre` in this case is important to keep aspect ratio of our picture, using a monospaced font.

Calling the `drawAscii` method at the end of our `image.onload` callback, we get the following result:

![Drawing ASCII image without break lines](/img/posts/single-line-ascii-image.gif)

At first glance, it seems it doesn't work. Yet, if we scroll horizontally, we notice some strings wandering through the screen. Our picture seems to be on a single line. And indeed: all our values are on a single dimensional array. Hence, we need to add a break line every `width` value:

``` js
const drawAscii = (grayScales, width) => {
    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        let nextChars = getCharacterForGrayScale(grayScale);

        if (index % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    asciiImage.textContent = ascii;
};
```

Result is now far better, except for a detail...

![Drawing far too big ASCII image](/img/posts/too-big-ascii-image.gif)

Our image ASCII representation is huge. Indeed, we mapped any single pixel to a character, spread on a lot of pixels. Drawing a 10x10 small picture would then take 10 lines of 10 characters. Too big. We can of course keep this huge text picture and reduce font-size as shown in previous picture. Yet, that's not optimal, especially if you want to share it by email.

## Lowering ASCII Image Definition

When browsing the Web to check how other achieve such a resolution downgrade, we often find the average method:

![Computing Average Pixels Value on Image](/img/posts/ascii-image-average-value.png)

This technique consists in taking sub-arrays of pixels and to compute their average grayscale. Then, instead of drawing 9 white pixels for the red section above, we would draw a single one, still completly white.

I first dove into the code, trying to compute this average on the unidimensional array. Yet, after an hour of tying myself in knots, I remembered the next two arguments of `drawImage` canvas method: the output width and height. Their main goal is to resize picture before drawing it. Exactly what we have to do! I wasn't able to find how this is done under the hood, but I guess this is using the same average process.

Let's clamp our image dimension:

``` js
const MAXIMUM_WIDTH = 80;
const MAXIMUM_HEIGHT = 50;

const clampDimensions = (width, height) => {
    if (width > MAXIMUM_WIDTH) {
        return [MAXIMUM_WIDTH, height * MAXIMUM_WIDTH / width];
    }

    if (height > MAXIMUM_HEIGHT) {
        return [width * MAXIMUM_HEIGHT / height, MAXIMUM_HEIGHT];
    }

    return [width, height];
};
```

Note that we keep image aspect ratio to prevent some weird distortions. Then, we need to update our `image.onload` handler to use the clamped values:

``` js
image.onload = () => {
    const [width, height] = clampDimensions(image.width, image.height);

    canvas.width = width;
    canvas.height = height;

    context.drawImage(image, 0, 0, width, height);
    const grayScales = convertToGrayScales(context, width, height);

    drawAscii(grayScales, width);
};
```

If we upload our favorite Simpson character, here is the result:

```
                            k@d8
                          :c     a
                        "@h*k    .c
                       X.*   j]&kf}[1U%l
                       ^ Q  qJiiiiiii>}}Z!
                      M  -C-iiiiiiiiiiii}}h
                      0 .8;iiiiiiiiiiiiii}}Z
                      t W%iiiiiiiiiiiiiiii}]^
                      W&`!liiiiiiiiiiiiiiii}Z
                      m^iiiiiiiiiiiiiiiiiii_}-
                     .~#iiiiiiiiiiiiiiiiiiii}p
                     &`iiiiiiiiiiiiiiiiiiiii]}`
                     o`iiiiiiiiiiiiiiiiiiiiii}&
                     ';iiiiiiiiiiiiiiiiiiiiii}p]
                     `!iiiiiiiiiiiiiiiiiiiiiii}}~
                     'iiiiiiiiiiiiiiiiiiiiii++!}M
                     '!iiiiiiiiiiiii>iiiiIB. .!W@
                     o"iiiiiiiii)%1>1@+i[,      d
                     B'iiiiiiii%       #:        M
                     '`iiiiiiiM         j
                      w!iiiiii.         z     W*  ?
                      X`iiiiiB                 .  >
                       niiiiiW   .W.     ^
                       w`iiiiW    W,      .;b&8' %
                        [iYrif          k|>iiii}Wh
                        *iu}iiY         }iiiiiiiZU
                       z.}xioi!(      .piiiiiiiih}
                       !{hxiiWiiB~   o_iiiiiii!nL&
                        .xuiiiiiii!Iiiiiiii>-j8?|z8
                        > aiiiiiiiiiii]&BW#v_[[[[}zB
                        @ /iiiiiiiiZw[[[[[[[[[[[[[[cf
                          O~I;iiiib[[[[[[[[[[[[[[[[)0
                         `"iiiiil1[[[[[[[[[[[[[[[[[[z|
                         z!q&iiiX[[[[[[[[[[[[[[[[[[[j8
                         ]>]iiio[[[[[[[[[[[[[[[[[[[[[vx
                          miiiic[[[[[[[[[[[[[[[[[[[[[[C
                           b%Li][[[[[[[[[[[[[[[[[[[[[[8
                            .}!][[[[[[[[[[[[[[[[[[][/p
                             ?i][8[[[[[[[[[[[[[[]U&!
                             W!n[Y]J&*QcncZ#&#Z{]c(
                             Mi8[[[[[[[[[[[[[[[[{n
                             Ii>[[[[[[[[[[[[[[[[0i
                             .iiW[[[[[[[[[[[[[[c@
                              iii%[[[[[[[[[[[[}X.
                              iiiiMv][[[[[[[[}v*
                            .^<iiii>&c{[[[[[cQc#@n.
                            z"+iiiiii<oWoaM&(i[1" *
                           %".Q&m?>iiiiiiiiiii>}0 L%
                           :""   . ';Y@@WMiiiii[q`"'
                          ["""          k,_?iii?}W<"&*'
                          @""""         B"  diii}b),?",Uc
                          0","""       .,,  .Wii>I"&,;",,l*
```

Resolution has been decreased and we can't see as many details as before, but that's a mandatory inconvenience to get a shareable ASCII masterpiece.

## Final Demonstration

If we hide the `canvas` for the user and add some fancy CSS, here is our final ASCII Art Converter. And as usual, all the converter code is available on GitHub.

Note that we only handle static image in this case, but some people also handle live video stream, such as [the ASCII camera](https://idevelop.ro/ascii-camera/). Useless, therefore indispensable!
