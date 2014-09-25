---
layout: post
title: "Improve your Linux battery life with TLP"
---

I used to work on Windows, using some virtual machines for development. It is a good system, and I would have probably
never changed if I was not using [Docker](https://www.docker.com/). Indeed, Docker is based on **LinuX** Containers (LXC),
which obviously are not available on Windows. And booting a heavy VM to start a lightweight Docker container is not an
acceptable option. That's why I decided to switch.

Transition was pretty straightforward, and I had only three main issues:

* HDMI port did not (and still doesn't) work. Not a big deal as I also got a VGA port.
* Laptop battery life drastically reduced: from 3 hours on Windows, I get only an hour on Linux.
* CPU fan rejected very hot air. Nice feature yet: I had now a laptop/hair dryer. ;)

The two last points are linked. The CPU runs at the maximum of its capabilities, draining a lot of energy from the battery
and thus overheating. Fortunately, I found a quick and easy solution: using [tlp package](http://linrunner.de/en/tlp/docs/tlp-linux-advanced-power-management.html).
This tool setups automatically all the requirements for an efficient power management, without having to spend several days to
hack each utilities, hoping to not break your whole system. ;)

It takes care automatically of CPU scaling, hard disk management, Wifi power saving, etc. To install it, simply execute
the following:

``` sh
# Installing TLP
sudo add-apt-repository ppa:linrunner/tlp
sudo apt-get update
sudo apt-get install tlp tlp-rdw

# Running TLP (only required at first time)
sudo tlp start
```
The manual start is only required the first time as TLP is already configured to start at boot. If you want to be sure it is,
just launch the `tlp-stat` command and ensure it is enabled:

``` sh
sudo tlp-stat | grep "power save"
```

After installing this software, the two last bullets are now solved and my battery lasts more than 2 hours, which is acceptable
even if still below of Windows. Why is this utility not shipped by default with every Linux desktop distributions? It will save
some headaches for some Linux adopters, and would also be a small step against global warming.
