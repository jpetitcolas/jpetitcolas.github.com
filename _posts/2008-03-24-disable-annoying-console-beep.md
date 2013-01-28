---
layout: post
title: "Linux: disable the annoying system beep"
date: 2008-03-24
---

# {{ page.title }}

How to disable the annoying system beep you can hear on Linux console, when autocompleting a command for instance? Just edit your _/etc/inputrc_ file and uncomment (or add) the following line:

    set bell-style none

Just restart your shell, and that's it!
