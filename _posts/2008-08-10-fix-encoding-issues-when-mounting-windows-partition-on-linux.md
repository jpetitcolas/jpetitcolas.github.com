---
layout: post
title: "Fix encoding issues when mounting a Windows partition on Linux"
date: 2008-08-10
---

# {{ page.title }}

Even if it is strongly discouraged, some filenames may contains some accents or some other special characters. If it does not cause any problem in general, it may give serious issues when mounting the partition containing these files in another system. Say a Linux one.

It was the case with a recent Windows backup. Trying to mount it on my Linux system worked. Yet, all files containing accents were corrupted: unable to open it.

To solve this issue, you have to mount your partition with correct encoding charset. First, unmount this partition:

``` bash
umount /dev/sdb1
```

Then, remount it with the `iocharset` argument, containing the source encoding:

``` bash
mount -t auto -o iocharset=utf8 /dev/sdb1 /media/external_disk/
```

The first thing you should do now is to rename all the problematic files for an easier mounting the next time. ;)
