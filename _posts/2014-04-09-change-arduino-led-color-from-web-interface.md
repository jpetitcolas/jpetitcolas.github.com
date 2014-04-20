---
layout: post
title: "Change Arduino RGB LED color through a web interface"
---

# {{ page.title }}

After the first tutorial about [a morse encoder with Arduino](#), I decided to go further: using a web interface to drive
my board. To achieve this purpose, I used the [Johnny Five framework](https://github.com/rwaldron/johnny-five) (a Javascript Arduino
programming framework) and [Socket.io](http://www.socket.io) to communicate through web sockets.

## Wiring our RGB LED to our Arduino

### Plugging our RGB LED

First step is of course to create our circuit. We will need an RGB LED and three 330Ω resistors. The RGB LED is easily recognizable with
its four pins. Plug the longest to the ground, and the other to a resistor, as the following blueprint:

SCHEMA

And here is the textual description on a breadboard:

* RGB LED: four pins on C2, C3 (longest pin), C4 and C5
* Resistors: D2/F2, D4/F4, D5/F5
* Ground: D3
* Arduino pin 9~: G2 (red pin)
* Arduino pin 10~: G4 (green pin)
* Arduino pin 11~: G5 (blue pin)

We are using here some analogic-like Arduino outputs (symbolized by a tilde `~` near the pin number) as we need some discrete values. Indeed,
with only a binary field, we would be able to produce only pure red or no red colors for instance.

Yet, the Arduino is only capable to output binary signal. That's why this is not pure analogic signal but simulated one. This is done through
a physical process called pulse width modulation (PWM).

### Understanding the pulse width modulation (PWM)

## Introducing Johnny Five, the Arduino Javascript framework

[Johnny Five framework](https://github.com/rwaldron/johnny-five) is a Javascript Arduino framework, allowing us to control our circuit using our
favorite language. Far more developer friendly than Arduino native language, it will also provide us an easy way to interact with our prototype
using websockets.

### Preparing Arduino

### Bootstrapping Johnny Five

First, let's bootstrap our new Node.js LED color picker application, creating a `package.json` file in our project folder:

``` js
{
    "dependencies": {
        "johnny-five": "latest"
    }
}
```

Then, retrieve it effectively using a `npm install`. Here is our first testing program:

``` js
var five = require('johnny-five');

var led;
var board = new five.Board();

board.on("ready", function() {
    led = new five.Led.RGB([9, 10, 11]);
    led.strobe();

    this.repl.inject({ led: led });
});
```
If everything has been set up correctly, your LED should go through all color hues smoothly.

## Creating hue picker

We are going to create the web interface allowing us to change LED color. For more reusability and flexibility, we encapsulate
the code into a dedicated class.

``` js
var HuePicker = function(container, options) {
    this.container = container;

    this.width = options.width;
    this.height = options.height;

    this.marker = null;
    this.markerRadius = options.markerRadius || 5;
    this.markerX = 0;

    this.init();
};

/**
 * Initialize HuePicker widget and bind its events.
 */
HuePicker.prototype.init = function() {
    this._createCanvas();
    this.marker = this._createMarker();

    var self = this;
    $("circle")
        .draggable({ cursor: 'pointer' })
        .bind('drag', function(e, ui) {
            self._moveMarker(ui.position.left);
        });
};

/**
 * Create a canvas element and fill it with rainbow colors.
 * @private
 */
HuePicker.prototype._createCanvas= function() {
    // Let enough space to display marker correctly
    var width = this.width - 2 * this.markerRadius;
    var canvas = $('<canvas width="' + width + '" height="' + this.height + '">');
    canvas.css("margin-left", this.markerRadius);

    this.container.append(canvas);

    this.context = canvas.get(0).getContext("2d");
    this.context.fillStyle = this._getRainbowGradient();
    this.context.fillRect(0, 0, this.width, this.height);
};

/**
 * Return a canvas gradient containing all rainbow colors.
 * @returns {CanvasGradient}
 * @private
 */
HuePicker.prototype._getRainbowGradient = function() {
    var rainbowColors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

    var gradient = this.context.createLinearGradient(0, 0, this.width, 0);
    for (var i = 0, c = rainbowColors.length ; i < c ; i++) {
        gradient.addColorStop(i/c, rainbowColors[i]);
    }

    return gradient;
}

/**
 * Create SVG marker and return it.
 * @returns {*|jQuery|HTMLElement}
 * @private
 */
HuePicker.prototype._createMarker = function() {
    var svg  = '<svg>';
        svg += '<g id="marker">';
        svg += '    <line x1="' + this.markerRadius + '" y1="0" x2="' + this.markerRadius + '" y2="' + (this.height + 3 * this.markerRadius) + '"></line>';
        svg += '    <circle fill="red" cx="' + this.markerRadius + '" cy="' + (this.height + 15) + '" r="' + this.markerRadius + '"></circle>';
        svg += '</g>';

    this.container.append(svg);

    return $('#marker', svg);
}
```