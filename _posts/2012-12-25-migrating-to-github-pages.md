---
layout: post
title: Migrating to GitHub Pages
date: 2012-12-25
---

## WordPress, an overkill CMS

I used [WordPress](http://wordpress.org) during several years, since the first time I blogged. This incredible platform helps to put online very easily a website and offers a great community, with a wide choice of themes or plugins. I really enjoyed it. Yet, as time passes, this blogging platform turns deeper and deeper into a big CMS with a wide range of features. It is a good thing. This tool is greatly designed (for user experience at least... I always had some trouble with WordPress code). Yet, it is now a overkill solution for my humble blog, gathering only simple posts and pages.

I am always looking for minimalist tools. I rather like a single task efficient utility instead of a wide-featured platform. It may seem quite odd, but I will probably write a lot more with a very simple interface, or even in Vim. Writing everything in a single place, without any visual distraction. This is the key for effectiveness. For instance, I am currently writing this post on a fullscreen Vim. Only me, the keyboard and my terminal screen. And it rocks!

The use of a MySQL database is also a bad point. It is slow for my content which is mostly static. Of course, I correct some typos or clarify some points, but there is no major changes once a post is published. And the database tends to grow up very quickly. Simply writing a post inserts a lot of records for versionning (another feature I do not really care). And I do not speak about the plug-ins, which are keen on adding a lot of options stored in the base.

## Back to basics with GitHub Pages

### Jekyll, Git and MarkDown: a winning trio

That’s why I was looking for a light solution. I first discovered [Scriptogr.am](http://scriptogr.am), a blogging solution based on MarkDown format and DropBox storage. The ability to write posts in [MarkDown](http://en.wikipedia.org/wiki/Markdown) (a very simple yet powerful descriptive language) is a great choice. And keeping the control of all my files on my computer is also another important point. However, customizing my blog design was really painful and there were some big SEO issues (the biggest was probably the lack of 301 redirection between the Scriptogr.am domain and the custom one). That’s why I decided to look for other similar solutions. And I found GitHub Pages.

[GitHub Pages](http://pages.github.com/) keep the MarkDown format, allowing me to keep in sync all my posts on my devices thanks to Git. and with the use of [Jekyll](https://github.com/mojombo/jekyll), I can render my pages the way I want, writing the HTML I need. It is a little bit difficult to set up such a blog from scratch. Yet, first cloning [Mojombo’s blog repository](https://github.com/mojombo/mojombo.github.com) helps a lot. Some graphical adjustments, and here I go.

Jekyll is the engine converting my MarkDown pages into static HTML files. No PHP or other dynamic languages, no SQL request... All is pre-processed to increase at maximum the overall speed, has you may have perhaps already noticed.

Another great advantage of this solution is to provide you a [Fork me on GitHub!](https://github.com/jpetitcolas/jpetitcolas.github.com) link. If I committed a big mistake or if you have further details to give, you will be able to contribute to my articles for the community sake.

### GitHub Pages restriction

I was worried about some hosting restrictions. After all, GitHub is not a blogging platform, but a huge open-source repositories gatherer. So, I asked their support, and got an answer within the 24h (really reactive, especially taking the jet lag into account). Here is their answer (I extracted the only interesting part):

> Good questions!  About bandwidth limits, there are no hard limits, but our terms of service has a section on bandwidth usage under section G item 12. And about the number of pages you can have, there is no explicit limit here, but since your Pages are hosted in a GitHub repository, it’s subject to the same size limits as other repositories as discussed here.
>
> Finally, about topic restrictions, we have another item in our terms of service under section G item 7 that explains our position on content.

What do the terms of service say? I extracted related parts:

> If your bandwidth usage significantly exceeds the average bandwidth usage (as determined solely by GitHub) of other GitHub customers, we reserve the right to immediately disable your account or throttle your file hosting until you can reduce your bandwidth consumption.

What is the average used bandwidth? I do not really know. Yet, I do not really worry about that. I am hosting a technical blog about web development and open-source, with no big need of bandwidth (only static entries with a little bit of minified CSS and Javascript). And as a lot of other developers host their blog on GitHub without any problem, I am confident for the long term.

> For best performance, we recommend repositories be kept under 1GB each. This limit is easy to stay within if large files (typically, binaries) are kept out of the repo. If your repository exceeds 1GB, you might receive a polite email from support requesting that you reduce the size of the repository to bring it back down under 1GB.

Disk space use must be lower than 1GB by repository. Otherwise GitHub will warn you gently. No problem for this blog, containing essentially text posts (and perhaps sometimes some embedded videos or slideshows from an external source). According to the size of this post (almost 7kb), I would be able to write more than 160,000 posts before reaching the limit. I will think more about it when I will get more than 150,000 pages. ;)

> We may, but have no obligation to, remove Content and Accounts containing Content that we determine in our sole discretion are unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of Service.

No special limitation about the pages content. You have to respect the law, and it is normal. So, if you want to use GitHub to talk about your passion for Ancient Greece, it should not be a legal problem. Even if I do not think it is a correct platform to act so.

To sum up, my decision is taken: I am moving to GitHub pages. I am going to move all the former technical articles to this new platform progressively. It represents a huge amount of work, translating all the previous French content into English.

I take the opportunity given by this post to congratulate another time GitHub team. They are doing such a great job maintaining this awesome platform. Thank you all! :)
