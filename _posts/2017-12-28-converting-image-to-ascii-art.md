---
layout: post
title: "Converting an Image into ASCII Art"
excerpt: "While browsing Stack Overflow, I generally browse one or two links from the sidebar 'Hot Network Questions'. It brings me to several interesting topics, not necessarily related to development. And this time, I found an interesting post: how do ASCII art image conversion algorithms work?"
tags:
    - canvas
    - HTML
    - fun

illustration: "/img/posts/ascii-art-converter/homer-living-room-ascii.png"
illustration_title: "ASCII Homer in his living room"
illustration_link: ""
---

While browsing Stack Overflow, I generally click on one or two links from the sidebar "Hot Network Questions". It brings me to several interesting topics, not necessarily related to development. And this time, I found an interesting post: [how do ASCII art image conversion algorithms work?](https://stackoverflow.com/questions/394882/how-do-ascii-art-image-conversion-algorithms-work)

ASCII art image conversion basically consists in two steps: converting our picture into gray colors, and map each pixel to a given character depending of the grayscale value. For instance, `@` is darker than `+`, which is also darker than `.`. So, let's try to implement such an algorithm in pure JavaScript.

For those in a hurry, you can test the converter directly in [final demo](https://www.jonathan-petitcolas.com/ascii-art-converter/), or read its source code directly on its [GitHub repository](https://github.com/jpetitcolas/ascii-art-converter).

## Uploading an Image into a Canvas

![Homer Simpson](/img/posts/ascii-art-converter/homer.png)

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

If we embed previous script on our HTML page and upload Homer, we can display it into our `canvas` element:

![Upload Preview in Canvas](/img/posts/ascii-art-converter/upload-preview.png)

**Note:** if you want to snap a picture from your webcam, please refer to [Taking Picture From Webcam Using Canvas](https://www.jonathan-petitcolas.com/2016/08/24/taking-picture-from-webcam-using-canvas.html) post.

## Turning an Image into Gray Colors

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
The `for` loop requires some explanations. We retrieve each pixels in the `imageData.data` object. However, it is a uni-dimensional array, each pixel being splitted into its four components: red, green, blue, and alpha (for transparency). We retrieve the RGB value from the three first data cells, compute our grayscale, and then, move on of 4 indexes to go at the start of the next pixel components.

In this snippet, we modified the original image data, causing our function to be impure. Indeed, I wasn't able to find a way to update image data using a copy of our `imageData` variable.

Adding a call to `convertToGrayScales` function at the end of our `image.onload` listener, we can upload a picture in gray colors:

![Grayscale Homer Preview](/img/posts/ascii-art-converter/grayscale.png)


## Mapping the Pixels to Gray Scale Values

Now that we have a list of grayscale values for every pixel, we can map each of these value to a different character. Reason behind this mapping is simple: some characters are darker than others. For instance, `@` is darker than `.`, which occupies less space on screen.

The following character ramp is generally used for this conversion:

```
$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`'.
```

Hence, mapping a gray scale value to its equivalent character can be done via:

``` js
const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
const rampLength = grayRamp.length;

const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];
```

We retrieve the corresponding character using a cross-shaped product: gray scale of 0 (black) should be `$`, and a white pixel (gray scale of 255) should be a space. We substract 1 to `rampLength` as arrays start at 0 index.

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

We use a `pre` tag in order to keep aspect ratio of our picture, as it uses a monospaced font.

Calling the `drawAscii` method at the end of our `image.onload` callback, we get the following result:

![Drawing ASCII image without break lines](/img/posts/ascii-art-converter/single-line-ascii-image.gif)

At first glance, it seems it doesn't work. Yet, if we scroll horizontally, we notice some strings wandering through the screen. Our picture seems to be on a single line. And indeed: all our values are on a single dimensional array. Hence, we need to add a break line every `width` value:

``` js
const drawAscii = (grayScales, width) => {
    const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
        let nextChars = getCharacterForGrayScale(grayScale);

        if ((index + 1) % width === 0) {
            nextChars += '\n';
        }

        return asciiImage + nextChars;
    }, '');

    asciiImage.textContent = ascii;
};
```

Result is now far better, except for a detail...

![Drawing far too big ASCII image](/img/posts/ascii-art-converter/too-big-ascii-image.gif)

Our image ASCII representation is huge. Indeed, we mapped any single pixel to a character, spread on a lot of pixels. Drawing a 10x10 small picture would then take 10 lines of 10 characters. Too big. We can of course keep this huge text picture and reduce font-size as shown in previous picture. Yet, that's not optimal, especially if you want to share it by email.

## Lowering ASCII Image Definition

When browsing the Web to check how other achieve such a resolution downgrade, we often find the average method:

![Computing Average Pixels Value on Image](/img/posts/ascii-art-converter/ascii-image-average-value.png)

This technique consists in taking sub-arrays of pixels and to compute their average grayscale. Then, instead of drawing 9 white pixels for the red section above, we would draw a single one, still completly white.

I first dove into the code, trying to compute this average on the unidimensional array. Yet, after an hour of tying myself in knots, I remembered the next two arguments of `drawImage` canvas method: the output width and height. Their main goal is to resize picture before drawing it. Exactly what we have to do! I wasn't able to find how this is done under the hood, but I guess this is using the same average process.

Let's clamp our image dimension:

``` js
const MAXIMUM_WIDTH = 80;
const MAXIMUM_HEIGHT = 50;

const clampDimensions = (width, height) => {
    if (height > MAXIMUM_HEIGHT) {
        const reducedWidth = Math.floor(width * MAXIMUM_HEIGHT / height);
        return [reducedWidth, MAXIMUM_HEIGHT];
    }

    if (width > MAXIMUM_WIDTH) {
        const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / width);
        return [MAXIMUM_WIDTH, reducedHeight];
    }

    return [width, height];
};
```

We focus on height first. Indeed, to better appreciate the artist behind their work, we need to contemplate their art without scrolling. Also note that we keep image aspect ratio to prevent some weird distortions. We now need to update our `image.onload` handler to use the clamped values:

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

{% raw %}
<pre style="font-size: 10px;">
                                                  U88f
                                             mr kzB   C'
                                            8  f   @   t
                                            ^  8@m-!l!{o%
                                           w c#1)i!!!!!!!!B
                                           B@1L)[!!!!!!!!!IW
                                           @)1Y)!!!!!!!!!!!,B
                                          @o)))[!!!!!!!!!!!!"J
                                         "1))))!!!!!!!!!!!!!l|
                                         @)))))!!!!!!!!!!!!!!"|
                                         u)))))!!!!!!!!!!!!!l,@
                                        <1)))))!!!!!!!!!!!!!!lf
                                        Y1)))))!!!!!!!!!!!!!!!I
                                        C))))))!!!!!!!!!!!!!!!"X
                                        ())))))i!!!!l!!!!!!l!ll"X
                                        `1)))))?!&]  }&!!)q   p]?
                                         t)))))1|      pU       j
                                         a)))))0        @       f
                                         #))))q         '        ^
                                         i))))@  a8      !    <@ l
                                          t)1)W  li      !      .                           :
                                          8)d1W         "`t@XfC %                         %11x]
                                        ~*@1)@)         @^;ll,|j                         %))[!M)LI
            '&zo!                       ^:fx)X)*       O!!!!!l~^"                       cc/!!J)]~x
            j)!llO                        B*))f)Q{   'B!!!!!!]@;x                      B{{i*W1]!!!q
         "MUB1}!!l{                      ' Z))))<!>(?!!!))){0*<@n                     b1{!!!<f!!c@@
         j!!!Z1*d))@                       q))))-!!>#WwLCm0ft??]!t*.@cw               U)!!!!!ol@1))*
        %1!!!!@+!!!iB                     8)%)))-!@/t/}}11]???????]W-?f              :1}Cl!!l,B)1!!!X
        p))!!f{!!!!!+                    W!i!))){&f]??????????????????Y              Q)>!1!!!:1}!!!l8
       @~jB)<*!!!,f!;k                   xvoh)))@t?????????????????]B?B              %)!lZ","%)!!!@!W
      L!!!!<Q|!!!ll!!q                   k)L))))t)?????????????????t@)*             Y))!!!kBaM~!xCxIx
      B!!!!!>c!!,8!!!"B                  IX11Y)#t??????????????????]f]8            81))!!xl!!!MI_#!u
      B)!!!!!%?!@!!!!!">b                  ?#))%t????????????????????-0          ~h)))_!!h!!!!!i!i^Y
      W)@|!!l@!!lx!!!!!!"Y(                 8))af???]????????????|B{{@          M)))){!!!!!!!!!!i"@
      'ff/|)xt1!!O!!!!!!!!"w!               @))Wf?????????????????%           -*))))?!!!!!!!!!!,"8
       m11kb1))!!!!!!!!!!!!!"*;             @))8t????????????????%          ;@11)))!!!!!!!!!!!"xf
        o1))))))!!!!!!!!!!!!!I"@            @)))t???????????????@         l@1)))){!!!!!!!!!!!"@
         /m)))))]!!!!!!!!!!!!!!I,@          B)))&/???????????]]q        JM1)))))>!!!!!!!!!!!"%
           bq))))1!!!!!!!!!!!!!!!I,&        W))))W)??????????W:    ` IBY))))))-!!!!!!!!!!!!,B
             @1))))!!!!!!!!!!!!!!!!I;& d.   Z)))))+@}?????}@-<   nJuB1)))))){!!!!!!!!!!!!!"8
              xc)))){!!!!!!!!!!!!!!!!l)h]@  ())11)>ilrh&k/l!^"  a!lll81)))}!!!!!!!!!!!!!!"&
                B)))))-!!!!!!!!!!!!!!!!!(l*#@#X+l     X<!!!!,qQmqlllllC1[!!!!!!!!!!!!!!!"@
                 h()))))!!!!!!!!!!!!!!!]  lLilll'    ..}i!!!:Il [lllll:L!!!!!!!!!!!!!!!"@
                  ,*)))))}!!!!!!!!!!!!l%   lklll     W  q!!!!I?  ~ll"   8!!!!!!!!!!!!!"8
                    &))))))!!!!!!!!!!!!W    l$l,     p   $!!lq   J^      b!!!!!!!!!!:"k
                     >d)))))[!!!!!!!!!+      I}      '    x!@;   o       :l!!!!!!!!"+]
                       @1)))))!!!!!!!!B      `o     |     ]U  B  M        B!!!!!!I"o.
                        Uc)))))<!!!!!i        I|JbooB         ^. o        .>!!!!",a
                         .B)))))}!!!!a         B               @'          @!!:"M`
                           bf)))))!!O.         t               1           >I"1Y
                            ^&)))))i'          .                _           _8
                              @)))1Z                            B           0
                               1Z)@l                            C          `;
                               .;$lll`                          .         Q>
                                @llllll                          ?      {a
                                 zrlllll^                        *   +%x
                                   Zh;llll.                     fB@J
                                     ./MBW8z                      %
</pre>
{% endraw %}

Resolution has been decreased and we can't see as many details as before, but that's a mandatory drawback to get shareable ASCII art.

As usual, here are the related links:

 * [Final ASCII Art Converter Demo](https://www.jonathan-petitcolas.com/ascii-art-converter/),
 * [GitHub Repository](https://github.com/jpetitcolas/ascii-art-converter)

Note that we only handle static image in this case, but some people also handle live video stream, such as [the ASCII camera](https://idevelop.ro/ascii-camera/). Useless, therefore indispensable!
