---
layout: post
title: "Windows: save disk space deleting hiberfil.sys file"
date: 2012-10-09
---

# {{ page.title }}

If you already have put a look on the biggest files of your Windows partition (with tools like [WinDirStat](http://windirstat.info/) for instance), you may have noticed the file _hiberfil.sys_. This file weighs several Gigabytes alone.

Its aim is to keep a trace of all your current data when your computer goes to sleep. When exiting hibernation, it is used to restore your data in their state before the standby. So, if you do not use this feature, you can delete it freely, thanks to the following command (to execute in command line, as an administrator):

``` raw
powercfg -h off
```

It will prevent your computer to hibernate. Just reboot your system, and the file will be permanently deleted.