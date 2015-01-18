---
layout: post
title: "Playing with websockets in Go"
---

We believe in Go language to achieve a lot in asynchrounous world. With its system of channels, it is pretty straightforward to develop a multi-threaded application. To achieve this purpose, we decided to start a new project during one of our hackday: building a collaborative editing tool such as CollabEdit in Go: GollabEdit. ;)

We inspired ourselves from chat application tutorials. Indeed, it is pretty similar, except we don't only append messages but allow to edit the whole file.

## Executing Go in a Docker container

As we don”t want to pollute our workstation with a wide set of softwares in several versions depending of the project, let's use Docker. Our `Dockerfile` looks like the following:

```
FROM ubuntu:14.04

ENV HOME /root

RUN apt-get update && apt-get upgrade --yes

RUN apt-get --yes --quiet install curl
RUN apt-get --yes --quiet install git
RUN apt-get --yes --quiet install mercurial

RUN cd /usr/local/src && \
    curl https://storage.googleapis.com/golang/go1.3.1.linux-amd64.tar.gz | tar xz

ENV GOPATH /srv
ENV GOROOT /usr/local/src/go
ENV PATH ${PATH}:${GOROOT}/bin

WORKDIR /srv/

ENTRYPOINT ["go"]
```

We base our container on an Ubuntu image on which we install Go dependencies. Then, we follow the [official procedure](https://golang.org/doc/install#install) to install Go. Finally, we set some required environment variables:

* GOPATH: folder containing our application and its dependencies
* GOROOT: folder containing Go binaries
* PATH: just for convenience purpose, to be able to call `go` directly

Finally, we make our container to execute the `go` command when run thanks to the `ENTRYPOINT` line.

Our container is now ready to be built:

```
docker build --tag=marmelab/go .
```

Thanks to the entrypoint previously configured, all the commands transmitted to our `docker run` command will be transmitted to the `go` executable inside our container. To ensure it is fully functional, let's write a simple "Hello World!" application:

``` go
// src/marmelab/gollabedit/main.go
package main

import "fmt"

func main() {
    fmt.Println("hello world!")
}
```

You can now execute:

```
docker run \
	--rm \
	--volume="`pwd`:/srv" \
	--tty
	--interactive
	marmelab/go src/marmelab/gollabedit/main.go 
```

It should display `hello world!` on your console. What are all of these arguments?

* `--rm`: just remove all container data between executions
* `--volume`: we map `pwd` (present working directory) to the `/srv` container folder
* `--tty`: connect `stdin` and `stdout` to our process, allowing to forward interruption signals such as `CTRL+C`
* `--interactive`: required with `--tty` option

To ease our next commands, we can create a `makefile` with these commands.

## Using websockets in Go

### Creating a messages Hub

We decided to use a centralized architecture: a central `Hub` is going to receive all ingoing messages and to broadcast them to each connected `Client`.

``` go
package main

type hub struct {
	// Registered clients
	clients map[*client]bool

	// Inbound messages
	broadcast chan string

	// Register requests
	register chan *client

	// Unregister requests
	unregister chan *client

	content string
}

var h = hub{
	broadcast:   make(chan string),
	register:    make(chan *client),
	unregister:  make(chan *client),
	clients: 	 make(map[*client]bool),
	content:  	 "",
}
```
We defined several channels for our `Hub`. This way, we would be able to deal asynchronously with both `register` or `unregister` events, or for broadcasting messages. At the end, we instantiate our hub.

Let's define its behavior thanks to a `run` method:

``` go
func (h *hub) run() {
	for {
		select {
		case c := <-h.register:
			h.clients[c] = true
			c.send <- []byte(h.content)
			break

		case c := <-h.unregister:
			_, ok := h.clients[c]
			if ok {
				delete(h.clients, c)
				close(c.send)
			}
			break

		case m := <-h.broadcast:
			h.content = m
			h.broadcastMessage()
			break
		}
	}
}
```

We take advantage here of the Go channels. Channels are like FIFO stacks. A `Client` will store a request into one of these channels, then go routine will unstack them as soon as possible, by their arrival dates.

Syntax `c := <-h.register` means attribute (`:=`) to `c` value first available value into `h.register` channel. `<-` shows we take a value from the channel. As the opposite, you put a value in a channel with `->`. So, when a `Client` wants to register, we add him to our connected clients array, and then send him current content. `[]byte` is just for casting reasons, as we are going to see later in `Client` code.

If a customer sends an `unregister` event, we just have to close its channel and remove him from `Hub` connections.

Finally, if we receive a message from one customer through the `broadcast` channel, we just update `Hub` content and broadcast the message to all other clients with following function:

``` go
func (h *hub) broadcastMessage() {
	for c := range h.clients {
		select {
		case c.send <- []byte(h.content):
			break

		// We can't reach the client
		default:
			close(c.send)
			delete(h.clients, c)
		}
	}
}
```

Do not forget the `break` here. This is the reason why we exceeeded the deadline of our hackday, a missing break. Thus, after broadcasting first message, websocket closed itself unexpectedly, with a very vague Chrome error message. This is the disadvantage of extreme programming: wanting to go still faster cause big time loss on trivial errors.

### Client emitter

That's all for the `Hub`. Let's focus on `Client` code now:

``` go
package main

const (
	writeWait = 10 * time.Second
	pongWait = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	maxMessageSize = 1024 * 1024
)

type client struct {
	ws *websocket.Conn
	send chan []byte // Channel storing outcoming messages
}
```

Note we defined several constants used later:

* `writeWait`: minimal delay before writing new message into socket
* `pongWait`: if a socket doesn't answer within this time range, consider `Client` is disconnected
* `pingPeriod`: period on which we test `Client` connection
* `maxMessageSize`: maximum message size, here 1kB.

Our main `Client` method is:

``` go
import (
	"net/http"
	"log"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  maxMessageSize,
	WriteBufferSize: maxMessageSize,
}

func serveWs(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	c := &client{
		send: make(chan []byte, maxMessageSize),
		ws: ws,
	}

	h.register <- c

	go c.writePump()
	c.readPump()
}
```

We first define a `websocket.Upgrader`, taken from the [gorilla/webwocket](http://www.gorillatoolkit.org/pkg/websocket) library. Then we retrieve a pointer to the websocket thanks to the `Upgrade` function. Finally, we register the `Client` to the `Hub`, stacking a message in the `register` channel. 

At the end, we can see we started a `writePump` and a `readPump`. Let's dive into the first:

``` go
func (c *client) readPump() {
	defer func() {
		h.unregister <- c
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error { 
		c.ws.SetReadDeadline(time.Now().Add(pongWait));
		return nil
	})

	for {
		_, message, err := c.ws.ReadMessage()
		if err != nil {
			break
		}

		h.broadcast <- string(message)
	}
}
```
We `defer` the execution of `Client` disconnection. This mean that, either parent function succeeds of fails, this code is going to be executed.

We set some properties on our websocket to ensure it won't hang indefinitely. Websocket first waits for a message during maximum `pongWait` seconds. If socket is still available when pinging it, we increase read limit duration by `pongWait` seconds. So, if `Client` is no more connected, websocket is going to throw an error, which will break the `for` loop below. We should then unregister.

We can read data, but what's happening under the hood of `writePump`?

```
import (
	// ...
   	"time"
)

func (c *client) writePump() {
	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.write(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

func (c *client) write(mt int, message []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, message)
}
```

Code is pretty similar to the `readPump`. We just introduced a `ticker`. Regularly, we are going to ping the websocket. If it doesn't respond, we then close the websocket.

### Launching websocket server

Let's assemble all the pieces of this innovative puzzle in `main.go`:

``` go
package main

import (
	"log"
	"net/http"
)

func main() {
	go h.run()
	http.Handle("/", http.FileServer(http.Dir("./public")))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```
We simply run our `Hub` as a go-routine and create an HTTP server. The only `/ws` route launch the data pumps for current `Client`. All static resources should be in the `public` folder.

To launch our server, you should first retrieve `gorilla/websocket` dependency:

```
docker run \
	--rm \
	--volume="`pwd`:/srv" \
	--tty
	--interactive
	marmelab/go get github.com/gorilla/websocket
```

Then, just execute:

```
docker run \
	--rm \
	--volume="`pwd`:/srv" \
	--tty
	--interactive
	--publish="8080:8080"
	marmelab/go run src/marmelab/gollabedit/*.go 
```

We added a `--publish` option here, to map our host 8080 port to our Docker container 8080 port.

## Collaborative editing front

For our prototype needs, we didn't use any library. If you need a better support of websockets, have a look on [Socket.io](http://socket.io/), the reference in this topic.

Our UI is damn simple: a simple textarea. So, let's focus on websocket connection:

``` js
$(function() {
    if (!window["WebSocket"]) {
        return;
    }

    var content = $("#content");
    var conn = new WebSocket('ws://' + window.location.host + '/ws');

    // Textarea is editable only when socket is opened.
    conn.onopen = function(e) {
        content.attr("disabled", false);
    };

    conn.onclose = function(e) {
        content.attr("disabled", true);
    };

    // Whenever we receive a message, update textarea
    conn.onmessage = function(e) {
        if (e.data != content.val()) {
            content.val(e.data);
        }
    };

    var timeoutId = null;
    var typingTimeoutId = null;
    var isTyping = false;

    content.on("keydown", function() {
        isTyping = true;
        window.clearTimeout(typingTimeoutId);
    });

    doc.on("keyup", function() {
        typingTimeoutId = window.setTimeout(function() {
            isTyping = false;
        }, 1000);

        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(function() {
		if (isTyping) return;
		conn.send(doc.val());
        }, 1100);
    });
});
```

Code is self-explained. The only particularity is our basic anti-flood protection. If you send a new payload at each keydown, you are going to get a serious bottleneck on your server. So, be smarter using timeouts: we send data only if user hasn't typed for the last second. This is a good compromise.

## Going further?

If you try it as civilized gentlemen, one after each, everything is going to work fine. But, if you change the document exactly at the same time, troubles come...

```
1. Initial document is: "Hello world!"
2. User A changes "Hello" to "Good morning"
3. Meanwhile, user B changes "world" to "everybody"
4. Server receives first B request, then A request. 
	a. Hub changes "Hello world" to "Good morning world!"
	b. A and B receives "Good morning world!"
	c. Hub changes "Good morning world!" to "Hello everybody!"
	d. A and B receives "Hello everybody!"
```

Thus, user A changes have been lost. Furthermore, document should have blink between 4b and 4d. This is the core of concurrent edition issues. Our hackday is now well overran, and problematic is so complex it requires further investigation. By lack of time, we had to stop here.

A solution consists to use Git and its branch system. For instance, initial document is `master`. User A creates a `user_a` branch and user B a `user_b` branch. Hub is in charge of merging each branches into master. If there is a conflict, then UI could show the diff and asks for user which version he would like to keep.

If you want to try it at home, code is available on GitHub.
