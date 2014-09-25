---
layout: post
title: "Parsing binary files in Go"
---

I am currently working on a Go library to parse Starcraft2 replay files. These files are stored in binary format (called
MoPaQ) where each sequence of bytes is related to a specific information. For instance, the four bytes at position 8
represents the header offset, which is 1024. It means that real game data are going to start at the 1024th byte.

I won't cover the whole MoPaQ parsing in this post. I will probably write a dedicated article for it when I'll get
satisfactory results. Instead, here is an elegant way Go offers to parse binary files. As a support, you can download
one of my [replay file](/assets/2014/09/catallena.SC2Replay).

Browsing the Internet gave me the following truncated data structure for MoPaQ header:

```
Attribute			Location			Hexadecimal value	Meaning
-----------------------------------------------------------------------------------------------
Format				0x0000 -> 0x0003	4D 50 51 1B			MPQ\x1b (format name)
UserDataMaxSize		0x0004 -> 0x0007	00 02 00 00			512
HeaderOffset		0x0008 -> 0x0011	00 04 00 00			1024
UserDataSize		0x0012 -> 0x0015	3C 00 00 00			60
					0x0016 -> 0x0020	05 08 00 02 2C		?
Starcraft2			0x0021 -> 0x0042	53 74 61 [...]		"Starcraft II Replay 11" in binary
```
So, let's start by loading our file:

``` go
package main

import (
	"fmt"
	"log"
	"os"
)

func main() {
	path := "data/replay.SC2Replay"

	file, err := os.Open(path)
	if err != nil {
		log.Fatal("Error while opening file", err)
	}

	defer file.Close()

	fmt.Printf("%s opened\n", path)
}
```

This code is pretty straightforward: we use the `os` library to manipulate file, and just ensure we did not encounter
any error during this process. The main point here is the `defer` statement: it ensures the `file.Close()` function is
called as soon as we exit current function, whether it fails or succeeds.

Then, let's ensure it is a valid Starcraft2 replay file checking the format name at the beginning:

``` go
func main() {
    // ...
    formatName := readNextBytes(file, 4)
    fmt.Printf("Parsed format: %s\n", formatName)

    if string(formatName) != "MPQ\x1b" {
    	log.Fatal("Provided replay file is not in correct format.")
    }
}

func readNextBytes(file *os.File, number int) []byte {
	bytes := make([]byte, number)

	_, err := file.Read(bytes)
	if err != nil {
		log.Fatal(err)
	}

	return bytes
}
```

The most interesting part of this code is the `readNextBytes` function. It takes two parameter: the file pointer and a
number of bytes to read. First step, we instanciate a slice of bytes to store our result. In this case, slice is equivalent
to an array with a fixed size of `number` bytes. Then, we put into our slice as many bytes as we can through the `file.Read`
function.

You can notice it returns several arguments (another great feature of Go). The first one is the number of read bytes. As
we do not have any use of it, we simply ignore it via the use of an underscore (the equivalent of `/dev/null` for Go
variables). The second returned value is error. If it is not `nil`, let's log the error message.

Finally, we check the format casting our bytes array into a string and ensuring it is equal to `MPQ\x1b`.

Now we get a valid file, we may continue our parsing manually, using the `readNextByte` function to get every next
sequences of bytes. However, there is a far more elegant way, achieved in two simple steps.

First, define a structure to store all the parsed attributes:

``` go
type Header struct {
	UserDataMaxSize uint32
	HeaderOffset uint32
	UserDataSize uint32
	_ [5]byte
	Starcraft2 [22]byte
}
```
According to our investigations, after format comes the `UserDataMaxSize`, encoded on 4 bytes. As it is an integer,
let's wrap it into an `uint32`, which is also encoded on 4 bytes. Respecting fields length using correct types is the key point
here, as binary parsing is based on structure fields memory allocation.

Notice the attribute `_`. As previously seen, it means we don't care about it. And as we got 5 unknown bytes, it is important
to pinpoint this offset to not parse it. In this case, we simply move the cursor five bytes forward. We may get several
`_` if required.

Now, here is the magical glue between our structure and file:

``` go
import (
    // ...
    "bytes"
    "encoding/binary"
)

func main() {
    // ...

	header := Header{}
	data := readNextBytes(file, 39) // 4 * uint32 (3) + 5 * byte (1) + 22 * byte (1) = 43

	buffer := bytes.NewBuffer(data)
	err = binary.Read(buffer, binary.LittleEndian, &header)
	if err != nil {
		log.Fatal("binary.Read failed", err)
	}

	fmt.Printf("Parsed data:\n%+v\n", header)
}
```

We read the first 43 bytes, corresponding to the size of our structure. Then, we instantiate a new bytes buffer we are
going to map to our structure through a binary reader. The second argument specifies the [Endianess](http://en.wikipedia.org/wiki/Endianness)
of our data: in other words, the way bytes are stored. With `binary.LittleEndian`, it means the least significant byte is
stored in the smallest address, at the end of a given bytes sequence.

That's all folks! In simply three lines of code, we were able to parse our binary file. Go is so magic, isn't it?

Note: the whole code is available as a [Gist](https://gist.github.com/jpetitcolas/28893445d8062d7081d5).
