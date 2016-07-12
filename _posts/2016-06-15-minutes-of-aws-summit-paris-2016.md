---
layout: post
title: "Minutes of AWS Summit Paris 2016"
canonical: http://marmelab.com/blog/2016/06/15/minutes-of-aws-summit-paris-2016.html
canonicalLabel: marmelab blog
---

<img src="/img/posts/aws-summit-entrance.jpg" class="responsive" title="AWS Summit 2016" />

Thanks to [marmelab](http://www.marmelab.com), I attended, with [Kevin Maschtaller](https://twitter.com/kmaschta) who helped me to write this post, to the [AWS Summit](https://aws.amazon.com/summits/?nc1=h_ls) last month in Paris. Here is our feedback about this event which is, as its name implies, focused on Amazon Web Services.

## Technical Networking

The day began with a keynote from Werner Vogels, CTO of Amazon.com, followed by some Amazon customers testimonies. We arrived at the Louvre's Carousel earlier, so we started networking. And, when the keynote started, we were still discussing with other people.

We met several people, especially the news editor of [Programmez](http://www.programmez.com/) or the [Osones](http://osones.com/) team with whom we are used to work as they host several of our customer projects. We talked about the promising [serverless](https://github.com/serverless/serverless) project, more about this topic with [the related conference](#the-promising-serverless).

We also hanged out along different partner stands. Nothing really new here, the majority of the partners was monitoring companies. However, we spent some time at the Intel stand, where they brought a prototype of plant supervisor. With some sensors plugged on the Amazon IoT platform, they are able to detect when the plant is thirsty. It reminds us one of our previous project ([Advanced Mint Monitoring with Arduino and D3.js](http://www.jonathan-petitcolas.com/talks/2014-09-24-advanced-mint-monitoring-with-arduino-and-d3js.html)).

<img src="/img/posts/aws-summit-networking.jpg" class="responsive" title="AWS Summit 2016" />

Another partner who interested us was [DataDog](https://www.datadoghq.com/). They offer a monitoring service (such as [New Relic](https://newrelic.com/) and newly discovered [Instana](https://www.instana.com/)), but this one seems really completed, with nice infrastructure data visualization and well trained setup (at least, from what we have seen in a commercial presentation). The only drawback is the price, which seems excessive, $15 per host, for smallest projects.

After chatting with so many people, including members of the [French Tech](http://www.lafrenchtech.com/), morning already ends. So, we didn't follow carefully the opening keynote. However, networking is also a major advantage of such events.

## Best Practices to Migrate to the Cloud

<div class="embed-container" style="padding-bottom: 63%;"><iframe src="https://pages.awscloud.com/rs/112-TZM-766/images/summit-paris-16-track3-session1.pdf" scrolling="yes" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

We attended to the "Best Practices to Migrate to the Cloud" talk. Yet, we were quite disappointed as title was misleading. It should have been "Why should you migrate to the Cloud?". Nothing really new here. Moving to the Cloud allows you to reduce your infrastructure costs and to improve your scalability. Yet, it is far better to be helped by some experts, as cloud in general (and AWS particulary) is quite hard to master.

## Make your Cloud Strategy a Success Asking you Good Questions Priorly

<div class="embed-container" style="padding-bottom: 63%;"><iframe src="https://pages.awscloud.com/rs/112-TZM-766/images/summit-paris-16-track2-session2.pdf" scrolling="yes" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

This talk is a presentation of the [AWS Cloud Adoption Framework](https://aws.amazon.com/professional-services/CAF/). The CAF is a guide helping new users to enter the cloud. It asks a wide range of questions to analyze forces and weaknesses of a company's cloud transition. For instance, there are some questions about risk management, application migration patterns, or process automation. That's probably a really interesting topic for cloud newcomers from big corporations, but as an innovation workshop, we are already used to deploy our application to the Cloud. And all our processes take this decentralized infrastructure into account.

## AWS IoT and Amazon Echo

<div class="embed-container" style="padding-bottom: 63%;"><iframe src="https://pages.awscloud.com/rs/112-TZM-766/images/summit-paris-16-track1-session3.pdf" scrolling="yes" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

This session is the best session we attended during this event. We had a live demo of Amazon IoT capabilities. All the audience was asked to connect to a mobile website, including some connectivity scripts to Amazon IoT. Then, the speaker asked to [Amazon Echo](https://en.wikipedia.org/wiki/Amazon_Echo) "show me on which OS runs all the smartphones in the room". All iOS smartphones then highlighted in blue, and Android ones in green. Everyone was then able to see which OS was majority. It handled 200 devices quite well, with very few latency.

Amazon IoT deals with as many devices as you want, providing a message broker (speaking [MQTT](https://en.wikipedia.org/wiki/MQTT)) and an authentication process for both devices and users, all of it deported to the (Amazon) Cloud.

IoT works with `Things Shadow`, which are virtual representations of all your devices. All state changes are propagated to these shadows, allowing your application to be resilient to device disconnections. And, icing on the cake, as IoT is part of Amazon Web Services, you can easily plug it to all other existing services, such as [DynamoDB](https://aws.amazon.com/documentation/dynamodb/), [Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html), or even [Amazon Machine Learning](https://aws.amazon.com/en/machine-learning/).

We are pretty enthusiastic about this new platform. However, the limited support of IoT protocols (only MQTT is supported) is not really comforting. There is indeed a [plethora of IoT protocols](http://www.rs-online.com/designspark/electronics/knowledge-item/eleven-internet-of-things-iot-protocols-you-need-to-know-about), and wiring on the cloud a vast set of devices would inevitably confront developers to these non-interoperable ways of communication.

## The Promising Serverless

<div class="embed-container" style="padding-bottom: 63%;"><iframe src="https://pages.awscloud.com/rs/112-TZM-766/images/summit-paris-16-track1-session2.pdf" scrolling="yes" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

[Serverless](https://github.com/serverless/serverless) is a framework allowing to build applications without any central server, just using some AWS services. It is a really exciting technology we already experimented a long time ago. Apparently, it has well grown up and some serverless projects are about to be deployed in production.

About that, we attended to the talk called "Serverless in one hell of a state" where [Cédric Dupui](https://twitter.com/CedricDupui) showed us the capabilities of this technology with a live demo. Without any server, he took, through smartphones, five pictures of audience's volunteers which were retouched to add a mustache on them, and then displayed on a website. Finally, he was able to show us the analytics of the demo collected and stored in an Elasticsearch/Kibana stack.

It was really impressive to see how this technology can now support all the needs of an average web and mobile application. You can be certain that we'll go further about this method if it allows us to save server costs. The only cloud on the horizon is that whether the serverless will be the norm, all the developers will be forced to learn how to use AWS and all their applications will be locked on this platform.

If you want more informations about serverless applications, here are few links:

* [AWS Zombie Apocalypse RoadShow](https://aws.amazon.com/fr/zombie-reg-paris-sept-2016/), workshop to help you build serverless applications
* [AWS Serverless Multi-Tier Architectures](https://d0.awsstatic.com/whitepapers/AWS_Serverless_Multi-Tier_Architectures.pdf), Amazon's white paper about serverless

## Secure your Applications with AWS

<div class="embed-container" style="padding-bottom: 63%;"><iframe src="https://pages.awscloud.com/rs/112-TZM-766/images/summit-paris-16-track2-session4.pdf" scrolling="yes" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe></div>

The last but certainly not the least talk we've attended is a good reminder of how to secure your AWS account and all applications or services hosted in.

[Sébastien Stormacq](https://twitter.com/sebsto) explained us, after a brief introduction, the basics of AWS security: how and why it's important to well configure your IAM service, activate the Two Factor Authentication for all your accounts, and open only the strictly needed endpoint and ports to the Internet.

But he also mentionned advanced technicals, such as:

- Forbid your DevOps to connect on production servers as everything should be automated. Or, if needed, set up a dedicated server which would be the only allowed entry point to all other servers. This way, you would be able to shut it down 99% of the time,
- Configure your <abbr title="Virtual Private Cloud">VPC</abbr> allowing to increase speed and security of your apps,
- Encrypt all your data (both static and dynamic),
- Be alerted and forbid unexpected action to your AWS services with a combination of CloudWatch, CloudTrail and AWS Config0

Whether you are used to manipulate AWS or not, if you have a production application hosted on it, I strongly recommend you to take a look on this presentation.

## Conclusion

This AWS Summit was a good opportunity for us to meet new people and to learn a few things about AWS services. Yet, this event was far too commercial and not enough technical. We know of course this is an event organized by Amazon. Yet, we miss some real feedbacks about Amazon services. We had only the shining advantages of all Amazon services. But what about their limitations?

AWS Summit is more an IT decision maker events than a developper one. Will you meet us at a next Summit? Probably not.
