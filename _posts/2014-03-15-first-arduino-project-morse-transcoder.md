---
layout: post
title: "Creating a Morse encoder with Arduino"
---

# {{ page.title }}

A few days ago, I received my [SparkleFun inventor's kit](https://www.sparkfun.com/products/12001). This kit includes an Arduino and a lot of electronic components such as LCD panel or drive motor. And, icing on the cake, it also provides several tutorials to brush up on electronic. In short, a perfect starter kit.

The first tutorial is about switching on and off a LED. Not really challenging (especially with the 4 lines provided source code). So, let's raise the bar higher: we will create a [Morse language](http://en.wikipedia.org/wiki/Morse_code) encoder. The Morse language maps each letter and number to a unique sequence of dot and dashes (respectively a short and long light flash). So, making the LED blinking, we would be able to transmit a message. Sounds more exciting, isn't it?

## Configuring SublimeText for Arduino development

First of all, either you use it or not, you have to download the [Arduino IDE](http://arduino.cc/en/Main/Software). Yet, if you try to develop with it, you will see how much this editor sucks. No code autocompletion, strange indentation, a not really eye-candy blue... Really, I tried to use it for a hour, but finally decided to find an alternative.

I am using Sublime Text for a while now, and I looked naturally for an Arduino plug-in. And, thanks to [Robot-Will](https://github.com/Robot-Will), I found such a plug-in: [Stino](https://github.com/Robot-Will/Stino). To grab it, simply use the package manager, looking for "Arduino-like IDE".

The configuration is not really straightforward. In order to compile and send your program correctly to your Arduino, you will have to configurate several parameters:

* **Arduino > Preferences > Select Arduino application folder:** the folder where `arduino` bin is,
* **Arduino > Preferences > Change Sketchbook folder:** location of all your Arduino programs,
* **Arduino AVR boards:** select your board model ("Arduino UNO" in the case of the SparkleFun's kit)
* **Serial port:** choose the corresponding port on which your Arduino is plugged (`/dev/ttyUSB1` in my case)

Selecting folders is pretty unergonomic. After selecting the menu item, a text field appear. Just press `/` (in Linux at least) and validate to see the folder hierarchy. Then, navigate with arrows to choose the appropriate input.

To access serial port devices, you should launch Sublime Text as root. I do not like this solution: does anyone have a workaround?

## Creating a basic LED circuit

Now we got a user-friendly Arduino editor, let's wire our board. You will need a LED, a 330Ω resistor, and the 5V power source from your Arduino. Here is the corresponding blueprint:

<p class="center">
    <img src="/img/posts/arduino/morse-transcoder/arduino-led-circuit.png" alt="Arduino - Blinked LED blueprint" title="Arduino - Blinked LED blueprint" />
</p>

Yet, no need of soldering iron as we have a breadboard. The breadboard is the board containing a lot of connection points. The board is splitted into two parts by a middle line. The two parts are electrically independant. Two vertical lines provides the energy source (`+`) and the ground (on the `-`). All the components legs plugged on the same horizontal line would be wired together. Knowing that, here is a way to plug all our components:

* Power line on the "Power 5V" Arduino pin
* Ground line on the "Power GND" Arduino pin
* LED: longest leg (the `+` leg) on C2 and shortest on C3,
* Resistor: A3 + Ground,
* Wire between Arduino pin 13 and E2

As a LED is a polarized component: you should plug it in the right position. At these voltage, it should not break anything. Yet, if you plug it wrongly, it would simply works as an opened switch.

Once our circuit built, let's try it with this really simple program:

``` c
void setup()
{
    pinMode(13, OUTPUT);
}

void loop()
{
    digitalWrite(13, HIGH);
    delay(1000);
    digitalWrite(13, LOW);
    delay(1000);
}
```
All Arduino programs should contain both the `setup` and `loop` functions. The first one initializes all our components. In this case, we tell Arduino the pin 13 will be used only as an output, and no input would be made on it. 

Then, the `loop` function will be executed forever (unless Arduino is stopped manually). In this case, we send a `HIGH` signal (meaning +5V) on the pin 13, which light on the LED. We wait 1 second, then we send a `LOW` signal (0V) to switch it off, and we wait again.

Now, verify/compile your code (CTRL + ALT + V) and then upload it (CTRL + ALT + U). If your circuit is wired correctly, the LED should slowly blink.

## Developing a Morse encoder

### Emitting a "SOS" signal

Now that our circuit is done, let's start by emitting one of the most famous Morse message: "SOS". The equivalent of `S` and `O` in Morse language are respectively `...` and `---`.

We are going to use the following conventions for our project (which are the recommended standards):

* Dot duration is 1 time unit,
* Dash duration is 3 time units,
* Each letter would be separated by 3 time units,
* Each word would be separated by 7 times units.

So, we are now able to write some very simple functions:

``` c
#define TIME_UNIT 200

void dot()
{
	digitalWrite(13, HIGH);
	delay(TIME_UNIT);
	digitalWrite(13, LOW);
	delay(TIME_UNIT);
}

void dash()
{
	digitalWrite(13, HIGH);
	delay(3 * TIME_UNIT);
	digitalWrite(13, LOW);
	delay(TIME_UNIT);
}

void endLetter()
{
	delay(3 * TIME_UNIT);
}

void space()
{
	delay(7 * TIME_UNIT);
}
```

We first defined the `TIME_UNIT` constant as a `#DEFINE` directive. It means all occurences of `TIME_UNIT` will be automatically replaced during compilation phase, saving some memory. Remember we are on an low memory device: memory is precious.

Then, we simply define several functions to apply our above conventions. So, if we want to emit a SOS signal, we just have to modify our `loop` function with the following code:

``` c
void loop()
{
	dot(); dot(); dot(); endLetter();
	dash(); dash(); dash(); endLetter();
	dot(); dot(); dot(); endLetter();
	space();
}
```
Upload your program, and you should see your distress beacon.

### Creating a library

As our code for Morse specific usage starts to grow, it is a good idea to move it into a separate library. We proceed as if we were doing some C: creating a header file and the library itself. The header file `MorseTranslator.h` contains only our function prototypes and class scoped variables:

``` c
#ifndef MORSE_TRANSLATOR_H
#define MORSE_TRANSLATOR_H

#include "Arduino.h"

class MorseTranslator
{
	public:
		MorseTranslator(byte pin, unsigned int timeUnit);
		void dot();
		void dash();
		void endLetter();
		void space();

	private:
		byte _pin;
		unsigned int _timeUnit;
};

#endif
```
Do not forget to embed the `Arduino.h`, as the Arduino library is not automatically imported in libraries.

As you may have noticed, the constructor of our library now takes the pin on which we want to send data, and the duration of our flash light (which is now an attribute of our class, for more flexibility). We split all our data between `public` and `private` keywords, according to their accessibility.

We used the type `byte` to define the output pin. In all the Arduino examples, pins are `int`, yet it consumes too much memory. An integer is indeed coded on two bytes (allowing values up to 32,767), whereas a `byte` (synonym of `unsigned char`) is coded on a single byte, allowing values up to 256, which is enough for our pins.

Finally, we just have to move all fonctions into the `MorseTranslator.ino` file, prefixing all our method by our class name:

``` c
#include "Arduino.h"
#include "MorseTranslator.h"

MorseTranslator::MorseTranslator(byte pin, unsigned int timeUnit)
{
	pinMode(pin, OUTPUT);
	_pin = pin;
	_timeUnit = timeUnit;
}

void MorseTranslator::dot()
{
	digitalWrite(13, HIGH);
	delay(TIME_UNIT);
	digitalWrite(13, LOW);
	delay(TIME_UNIT);
}

// ...
```
Now, your main file should look like:

``` c
#include "MorseTranslator.h"

MorseTranslator morseTranslator(13, 200);

void setup()
{
}

void loop()
{
    morseTranslator.dot(); morseTranslator.dot(); morseTranslator.dot();
    morseTranslator.endLetter();

    morseTranslator.dash(); morseTranslator.dash(); morseTranslator.dash();
    morseTranslator.endLetter();

    morseTranslator.dot(); morseTranslator.dot(); morseTranslator.dot();
    morseTranslator.endLetter();

    morseTranslator.space();
}
```

Upload again your program to ensure nothing broke during this refactoring.

### Using a Morse dictionnary

Next evolution is to use a dictionnary to map each letter to its Morse signal. As there is no native hash maps in Arduino world, we are going to use a structure, which is simply a new type definition containing several variables of different types.

``` c
struct dictionnaryEntry = {
	char character;
	String signal;
};

dictionnaryEntry dictionnary[36] = {
	{ 'a', ".-" },
  	{ 'b', "-..." },
  	// ...
  	{ '0', "-----" }
};
```
We define here a new data type `dictionnaryEntry`, composed of the input character and its Morse correspondance, stored in a `String`. Then, we define our dictionnary, containing all the translations. For content clarity, I did not include all the equivalences, but you can find it everywhere (for instance, on the [Wikipedia Morse page](http://en.wikipedia.org/wiki/Morse_code)).

Now, let's create a private function to get a signal from a given char (do not forget to update your header file):

``` c
String MorseTranslator::getSignalForChar(char c)
{
  	byte i;
  	for (i = 0 ; i < 36 ; i++) {
		if (dictionnary[i].character == c) {
      		return dictionnary[i].signal;
    	}
  	}

  	// If no matching character, consider it is a space.
  	return " ";
}
```

Finally, let's create an `emit` public function:

``` c
void MorseTranslator::emit(char c)
{
	String signal = getSignalForChar(c);

	byte i;
	char signalLength = signal.length();
	for (i = 0 ; i < signalLength ; i++) {
		switch (signal.charAt(i)) {
			case '.':
				dot();
				break;

			case '-':
				dash();
				break;

			case ' ':
				space();
				return;
		}
	}

	endLetter();
}
```

We are now able to change our `loop` function to use our newly created `emit` method:

``` c
void loop()
{
	morseTranslator.emit('s');
	morseTranslator.emit('o');
	morseTranslator.emit('s');
}
```

Of course, you can now change `dot`, `dash` and other former used functions accessibility to private, as we are just using `emit` now.

Upload again, and check that our beacon is still alive.

## Transmit user input to Arduino through Serial port

To communicate with our Arduino, we are going to use the `Serial` port. On the Arduino IDE, you can see at the top right corner the Serial monitor icon. Clicking on it, you will open a terminal on which you can read Arduino outputs and send some signals to it. We are going to use it to communicate with our keyboard.

First of all, we have to enable the Serial communication in the `setup` function, specifying the transmission rate in bauds. In our case, 9600 bauds would be far enough.

``` c
void setup()
{
	Serial.begin(9600);
	Serial.println("Serial link established!");
}
```

Then, in our `loop` function, we will check if some data are available on the Serial link, and if so, we will read it and emit the corresponding signal:

``` c
void loop()
{
	// If no serial link is available, do not go further.
	if (Serial.available() == -1) {
		return;
	}

	char c;
	while ((c = Serial.read()) > 0) {
		Serial.print(c);
		morseTranslator.emit(c);
  	}
}
```
The whole code is available on GitHub, and here is finally the video demonstration of our Morse encoder:

