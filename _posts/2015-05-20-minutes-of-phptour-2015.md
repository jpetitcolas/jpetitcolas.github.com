---
layout: post
title: Minutes of PHP Tour 2015
canonical: http://marmelab.com/blog/2015/06/01/minutes-of-phptour-2015.html
canonicalLabel: marmelab blog
---

Two weeks ago, we attended the PHP Tour 2015, organized by [AFUP](http://afup.org/), the French PHP Users Association in Luxembourg. It was a great chance to meet other passionate developers, to exchange about current PHP best practices, brand new frameworks, or other indispensable tips to enhance our productivity. But it was also the occasion to watch several interesting talks.

The theme of this edition was the <strong>cloud</strong>.
A lot of conferences were about migration from physical server to multi-scalable instances, and how to secure deployments.

## The Continuous PHP Pipeline, by Michelangelo van Dam

<div class="embed-container"><iframe src="//www.slideshare.net/slideshow/embed_code/key/a5pGRevdr0T9Yo" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

As a first talk, this was a good one. Michelangelo talked about continous deployment. Automating every step of the development process is fundamental to let developers do what they do the best: develop. Then, the recipe to transform production deployment for big events to a common task you can do every day is:

* Use Vagrant or Docker to manage your system infrastructure,
* Think about a SCM workflow to not let other developers get in your work,
* Detect regressions ASAP with continous integration (Jenkins, Travis, etc.)
* Smooth production deployment using continous full automated deployment

About continous integration, I especially remember of one quote, which illustrates perfectly agility in development:

<blockquote class="twitter-tweet" lang="fr"><p lang="en" dir="ltr">Fail as quickly as possible [...] If it hurts, do it more frequently [...] Everyone is responsible [...] via <a href="https://twitter.com/DragonBe">@dragonbe</a> <a href="https://twitter.com/hashtag/PHPTour?src=hash">#PHPTour</a> Lux</p>&mdash; Thierry Marianne (@thierrymarianne) <a href="https://twitter.com/thierrymarianne/status/598036606260510720">12 Mai 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

This talk showed a wide range of tools used to enhance your development process, to spend less time in cumbersome tasks, and think more about business solutions. We fully agree with it, as these concepts have been used for several years at [marmelab](http://marmelab.com/). ;)

Extra kudos for discovering [NetFlix Chaos Monkey](http://techblog.netflix.com/2012/07/chaos-monkey-released-into-wild.html), an evil monkey shutting down random parts of your AWS infrastructure.

## The Promise of Asynchrounous PHP, by Wim Godden

<div class="embed-container"><iframe src="//www.slideshare.net/slideshow/embed_code/key/nqxdRQwXKEWSS3" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

I was pretty lukewarm before attending to this talk. As a pragmatic developer, I generally try to use the right tool for the right purpose. If I want to do some asynchrounous tasks, I use Node.js or Golang, not PHP. Yet, I was curious enough to watch this speaker.

That was a nice surprise. I discovered [ReactPHP](http://reactphp.org/), a well-thought framework. It looks a lot like JS promises, which I've come to become fond of. If I were trapped in a pure PHP project, it would be worth to give ReactPHP a try. Otherwise, I would just keep Node.js. Indeed, some features or tools are still lacking to do asynchronous PHP efficiently. For instance, the excellent [async](https://github.com/caolan/async) utility to control multiple promises execution flow.

Side-effect discovery: there is already a built-in [Thread](http://php.net/manual/en/class.thread.php) class in PHP to manage asynchrounous tasks.

## Code your infrastructure, by Oswald De Riemaecker

<div class="embed-container"><iframe src="//fr.slideshare.net/slideshow/embed_code/key/TYO5IAirNSfeO" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

Oswald's motto is "Developers should focus on code, not on deployment". After a quick explanation about different provisionning tools (Puppet / Chef / Ansible), he focused on how to deploy PHP code with Chef, Berkshelf, Kitchen, Knife, Serverspec, Vagrant and Packer.

- `Chef` is used to provision servers in the architecture (installing Apache, MySQL & Solr) with a couple of cookbooks
- `Knife` is the command line tool helping to manage recipes
- `Berkshelf` manage cookbook dependencies
- `Kitchen` & `Serverspec` allow to test cookbooks automatically
- `Packer` creates images (iso/ami/..) that can be deployed to a cloud prodiver

This was a complete overview of how we can provision, test and deploy a simple application on a cloud infrastructure with some code and configuration.

## Comment migrer avec succès dans le cloud ? by Jonathan Van Belle

<div class="embed-container"><iframe src="//slides.com/grummfy/comment-migrer-avec-succes-dans-le-coud/embed" width="576" height="420" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

This talk was an honest feedback about how to migrate a nightmare website (no best practice, no documentation, huge developer turn-over) into a cloudy infrastructure. However, I didn't catch with this talk. The main motto of this talk is "Ask help everytime you need!". Of course it is still a valuable advice, but the lack of technical section left me a little bit disappointed.

## Frameworks: an History of Violence, by François Zaninotto

<div class="embed-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/ep3Oztvy0rk" frameborder="0" allowfullscreen></iframe></div>

Disclaimer: François is my boss at [marmelab](http://www.marmelab.com). So, yes, it is an excellent talk. ;)

More seriously, this talk was great, both in substance and form. François plays the leader of the Innovation Party, and tries to convinces the audience that we should not rely on big full-stack frameworks. Indeed, these frameworks are changing, unlike the business domain, which would still be topical. We should rather use micro-frameworks to reduce dependencies to a single code chunk. And do not hesitate to test new technologies into your real-world application. This way, you will be able to follow Web evolution without being stuck with outdated frameworks.

## Sauf erreur, je ne me trompe jamais, by Frederic Bouchery

<div class="embed-container"><iframe src="//fr.slideshare.net/slideshow/embed_code/key/hqQhqGvUC2k6to" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

Frederic explained during this talk how we should deal with errors in our PHP applications. To sum up, log everything but don't show any error messages for security reasons. Only banalities then (but just my personal opinion (-:).

## Ansible pour le Cloud, by Maxime Thoonsen

<div class="embed-container"><iframe src="//slides.com/maximethoonsen/ansible-pour-le-cloud-php-tour-2015/embed" width="576" height="420" scrolling="no" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>

I never use [Ansible](http://www.ansible.com/home) before. This talk inspired me a lot, and I will probably give it a try. Ansible allows to deploy apps based on configuration files, setuping your system easily. It integrates well with Docker containers, used both to install Docker on a fresh server, and to configure your container using some recipes.

## Retour d'expérience ARTE, par Thibault Lenclos

<div class="embed-container"><iframe src="http://thibz.com/phptour-2015/?full#coverpage"></iframe></div>

Thibault gave us some insights about processes to build a brand new REST API for ARTE. Thibault and his team worked the agile way (daily stand-ups, task prioritization, etc.), using continous integration as a safety net. He also shared a lot of technical details about what they used for automation, development and monitoring. Nice humane and technical feedbacks.

## Nobody Understands REST, but it is OK, by William Durand

<script async class="speakerdeck-embed" data-id="b14006e42cc247cdac1ad58e4cd7994a" data-ratio="1.29456384323641" src="//speakerdeck.com/assets/embed.js"></script>

William presented what REST really is: more than just using HTTP methods (GET, POST, etc.), it is also about HATEOAS and semantics. Yet, even if it sounds good, it is impossible to industrialize a strict RESTful API, and we should go toward a degraded REST standard that William calls HTTP++. Very instructive talk, with a good trip back to reality.

## Security workshop by Manuel Silvoso

I registered to the security workshop without a lot of hope. Generally, these kind of workshops show only the basic SQL injection and XSS vulnerabilities. Yet, it was the best security workshop I ever attended. I was nicely surprised. Manuel Silvoso let us of course manipulate these flaws, but also went further:

* How to secure passwords correctly, with `bcrypt`?
* Generate one-time password with [Yubikeys](https://www.yubico.com/products/yubikey-hardware/), a hardware device linked to an API
* Discovering of XSS dangers through [BeeF Framework](http://beefproject.com/)
* [OWASP Cheat Sheet](https://www.owasp.org/index.php/OWASP_Che
at_Sheet_Series), a list of known vulnerabilities and how to counter them
* Detect vulnerabilities using honey pots, IDS or tar traps
* Lot of other stuff

Slides are not publicly available. But if you want to play with his vulnerable app, that's on GitHub: [msilvoso/vulnerableApp](https://github.com/msilvoso/vulnerableApp).

## MVVM and Silex, by Billie Thomson

<script async class="speakerdeck-embed" data-id="7dad86c894144aba8dc06d0917e1ff07" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

Today, applications are often developed using a client framework such as Angular.js or React. The server application is then pushed to background, exposing only an API. This refreshing talk presented this new way of structuring web applications, using Angular and Silex, but also with an introduction to Express. Speaking of Node.js in PHP Tour was a daring but successful bet!

## PHP deploy 2015 flavor, by Quentin Adam

<div class="embed-container"><iframe src="//fr.slideshare.net/slideshow/embed_code/key/EJmUCyW1Gsbn0j" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

Here is another talk about deployment and its best practices. We can list:

* Do not use file system as a datastore (true for logs too)
* Mix datastores, each one has its own strengths and weaknesses
* Modularize your app with event brokers
* Do not commit dependencies

A good talk, even if there was too many animated Gifs.

## Chroniques d'un voyage vers l'Est, by Frédéric Hardy

<a href="http://blog.est.voyage/phpTour2015/">See full post (in French)</a>

I got tangled up in this talk. It deals with the application of strict object oriented programming. An object should only be aware of its own functioning and of its interface with the outside world. If the basic idea looks good, the practice implies a lot of interfaces, which as far as I understand, complexify the code a great deal. But I probably missed the point. :)

## PHP7 is coming, by Julien Pauli

<div class="embed-container"><iframe src="//fr.slideshare.net/slideshow/embed_code/key/k2XkYFQKs4C9Z" width="425" height="355" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

A quick overview of new features of PHP7:

* Syntaxic sugar with `??` or spaceship `<=>` (kudos for the name) operators,
* Fatal errors are turned into exceptions,
* Scalar type hinting,
* Ability to declare return types for functions,
* Anonymous classes, like anonymous functions

Performance isn't forgotten in this new version. You can expect using half the memory and CPU power with version 7 compared to PHP6.

## Conclusion

This was the first edition of PHP Tour we attended to. We were delightly surprised by the quality of talks, which were quite varied. See you again in 2016?
