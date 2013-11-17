---
layout: post
title: "Silex: static website usecase"
---

# {{ page.title }}

I recently helped a contact of mine to develop her company website (<a href="http://www.up-grading.fr">up'grading</a>). Her needs were really basic: some static pages and a FAQ.

I faced three main choices to achieve such a demand:

* WordPress: this blogging platform is also widely used as a static website skeleton. Yet, I am not a big fan of WP code base, and maintenance is painful as hell: upgrading core (even if it seems it is automatic from now), upgrading plugins, and so on... And why a database for such a a simple site?
* Pure PHP: sounds better. It would allow to embed only the strict minimum. Yet, I do not want to reinvent the wheel.
* Symfony2: a full stack framework would fulfill all requirements, but would also be overkill. No need of dependency injection in this case.

Ideal would be a solution between pure PHP and a full stack framework, a kind of Symfony2-lite. Fortunately, it already exists and is called [Silex](http://silex.sensiolabs.org).

Silex is part of micro-frameworks family. The best definition of what a micro-framework is available on [Flask website](http://flask.pocoo.org/docs/foreword/#what-does-micro-mean):

> “Micro” does not mean that your whole web application has to fit into a single [...] file, although it certainly can. Nor does it mean that [it] is lacking in functionality. The “micro” in microframework means [it] aims to keep the core simple but extensible. [It] won’t make many decisions for you, such as what database to use. Those decisions that it does make, such as what templating engine to use, are easy to change. Everything else is up to you, so that [it] can be everything you need and nothing you don’t.

Simplicity with flexibility. Sounds perfectly fitting our needs, isn't it? Let's explain the process of creating our static pages with Silex.

## Bootstrapping Silex

Installation is made through Composer. So, simply create a `composer.json` file containing the Silex dependency:

``` json
{
    "require": {
        "silex/silex": "~1.1"
    }
}
```
Then, let the magic happens with the `composer install` command. When completed, create a new `web/index.php` file containing the following "Hello world!" code:

``` php
require_once __DIR__.'/../vendor/autoload.php';

$app = new Silex\Application();

$app->get('/hello', function () {
    return 'Hello world!';
});

$app->run();
```
If you have correctly configured your VHost (especially with the document root pointing to the `web` directory), you should see the "Hello world!" when browsing the `/hello` URL. Managing routes with Silex is incredibly so easy.

## Installing a template engine: Twig

When you once tried Twig (the default template engine provided with Symfony2), you will never want to mix together PHP and HTML. Installing it is a two steps process, beginning with the inclusion of Twig in your composer file (do not forget then to update your dependencies through a composer update):

``` json
{
    "require": {
    	// ...
        "symfony/twig-bridge": "~2.3",
    }
}
```

Now simply register Twig as a Silex middleware (a middleware is a layer located between user request and framework response):

``` php
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/../views',
));
```
We just told Twig to look for our templates in the `views` directory. Thus, modify our controller to use a template:

``` php
$app->get('/hello', function() use($app) {
	return $app['twig']->render('hello.html.twig');
});
```
You are now able to validate the that Twig is correctly installed, refreshing the previous opened page. Yet, you would probably need to use Twig blocks inheritance for the global layout. Here is a simplified use case:

{% raw %}
``` xml
<!DOCTYPE html>
<html>
	<head>
		<title>{% block title "Welcome on my site!" %}</title>
		{% block stylesheets %}
			<link href="css/style.css" rel="stylesheet" />
		{% endblock %}
	</head>
	<body>
		{% block content "" %}
		{% block javascripts %}
			<script src="js/jquery.js"></script>
		{% endblock %}
	</body>
</html>
```
{% endraw %}

Here would be our templated hello page:

{% raw %}
``` xml
{% extends "layout.html.twig" %}

{% block title "Hello world!" %}

{% block content %}
	<h1>Hello world!</h1>
{% endblock %}

{% block stylesheets %}
	{{ parent() }}
	<link href="css/hello.css" rel="stylesheet" />
{% endblock %}
```
{% endraw %}

Notice we embed a specific stylesheet for this page only, thanks to the `stylesheets` block and a call to the `parent` function. It is a good practice to avoid fat resources, where some instructions are single page specific.

## Internal linking

Currently, if we want to make a link to the contact page, we would create something like:

``` php
<a href="/contact">Contact us</a>
```
Where `/contact` route would have been mapped with related view thanks to the `$app->get` method, as seen before. Yet, what would happen if we decide to change this route to `/contact-us`? We would have to grep all the contact links of our pages and change them accordingly. Or, we may use the [URL generator service](http://silex.sensiolabs.org/doc/providers/url_generator.html), which would simply turn a route name into its corresponding URL.

Let's start by registering this service. In the `index.php` file:

``` php
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());
```

Then, we have to give a name to our route. This is done through the `bind` method:

``` php
$app->get('/contact', function() use($app) {
	// ... 
})->bind('contact');
```
You are now able to generate URL based on your controllers into your Twig templates:

``` xml
<a href="{{ app.url_generator.generate('contact') }}">
	Contact us
</a>
```
## Organizing our routes

Even on a static website you should have a lot of really static webpages, resulting in many actions. Here is a snippet showing a way to avoid code duplication:

``` php
$routes = array(
    'home' => array('url' => '/', 'template' => 'home.html.twig'),
    'references' => array('url' => 'references', 'template' => 'references.html.twig'),
    'contact' => array('url' => 'contact', 'template' => 'contact.html.twig'),
    // ...
);

foreach ($routes as $routeName => $data) {
    $app->get($data['url'], function() use($app, $data) {
        return $app['twig']->render($data['template']);
    })->bind($routeName);
}
```
The `$routes` array contains all the data we need for our static pages: route name (for generating route through URL generator) as a key, URL and template. This is the place to add new pages.

## Creating the FAQ

FAQ is the chunk of this site. There must be a list of question links, each link redirecting to the question response. If we use the same solution as above, we would create a template for list and a template by question.

This is a bad solution. Indeed, there would be a lot of similar routes, and each time we want to add a question, we will need to update the question list. When something is done manually, it will necessarily break. So, to avoid a desynchronization between our responses and list, we have to be wiser.

### Storing data into a YAML file

Ideally, we would configure a database to store all our questions. However, as editorial changes would be rare, and as we want a website as light as possible, we would rather store the data in a simple file, a YAML one for instance.

Here is a possible structure, you may store in a `data/questions.yml` file for instance:

``` yaml
question_1:
    id: 1
    question: "Comment financer ma formation ?"
    slug: "comment-financer-ma-formation"
    answer: |
        <p>Il est possible de faire financer une formation par son employeur en utilisant le DIF, Droit Individuel à la Formation ou dans le cadre du CIF, Congés Individuel de Formation, ou de la VAE, Validation des Acquis de l’Expérience.</p>
        [...]
            
question_2:
    id: 2
    question: "Qu'est-ce que le coaching ?"
    slug: "qu-est-ce-que-le-coaching"
    answer: |
        <p>Le coaching professionnel est l’accompagnement personnalisé et suivi d’un individu ou d’un groupe, qui permet d’atteindre un objectif d’ordre professionnel ou privé.</p>
        [...]
```
Now we got our pseudo-database, we can create the listing page. But first, we should add the Symfony YAML parser to our dependencies:

``` json
{
	"require": {
		// ...
		"symfony/yaml": "2.1.*@dev"
	}
}
```
Then, add the following action:

``` php
use Symfony\Component\Yaml\Yaml;

$app->get('/faq', function() use ($app) {
    $yamlQuestions = file_get_contents(__DIR__.'/../data/questions.yml');
    $questions = Yaml::parse($yamlQuestions);

    return $app['twig']->render('faq/index.html.twig', array(
    	'questions' => $questions,
    ));
})->bind('faq');
```
It simply read the YAML file and pass the retrieved questions to the template. You can then display them very simply as the following:

{% raw %}
``` xml
{% block body %}
<ul>
    {% for question in questions %}
        <li>
            <a href="{{ path("faq_question", { "id": question.id, "slug": question.slug }) }}">
            	{{ question.question }}
            </a>
        </li>
    {% endfor %}
</ul>
{% endblock %}
```
{% endraw %}

Finally, let's create the final route for reading a response:

``` php
$app->get('/faq/{id}/{slug}', function($id, $slug) use ($app) {
    $yamlQuestions = file_get_contents(__DIR__.'/../views/faq/questions.yml');
    $questions = Yaml::parse($yamlQuestions);

    $question = $questions['question_'.$id];

    // Ensure URL is correct
    if ($question['slug'] !== $slug) {
        $app->abort(404, "Question slug does not match.");
    }

    return $app['twig']->render('faq/question.html.twig', array(
    	'question' => $question
    ));
})->bind('faq_question');
```
Which allows us to retrieve the whole question object in our template. We just operate a check on question slug to avoid duplicate content. If the slug is incorrect, then we stop the rendering and return a 404 response to the user.

As explained in this article, Silex may fit exactly the requirements of a static website with only a few lines of code. Yet, if you want to provide an administration panel, I would recommend to use either a CMS, or for custom features, a full-stack Symfony2 application with the are  the Symfony2 full framework, with the [SonataAdmin bundle](https://github.com/sonata-project/SonataAdminBundle).