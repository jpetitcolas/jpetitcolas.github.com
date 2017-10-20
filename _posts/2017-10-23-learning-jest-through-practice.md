---
layout: post
title: "Learning Jest Through Practice"
excerpt: ""
tags:
    - React
    - Jest
    - testing

illustration: ""
illustration_title: ""
illustration_link: ""
---

Jest is a Javascript testing framework published by Facebook. When browsing the [official website's homepage](https://facebook.github.io/jest/), three points are highlighted in particular: no configuration, improved performance and easy mocking. Are they marketing promises or reality? To answer this question, we will test Jest on a basic React project and explore its various possibilities.

## Yes-No Application

Let's consider a very simple application whose mock-up is the following:

![Yes-No Application](/img/posts/yes-no-app.png)


This application consists of a text input and a button. When the user clicks on the button, we display an answer ("yes" or "no") with an illustration image. Quite simple, but perimeter would be enough to test main Jest features.

The answer comes from a ~sophisticated deep learning~ random API: https://yesno.wtf/api/, returning either a `yes` or `no` response. Its format is:

``` js
{
    answer: "no",
    forced: false,
    image: "https://yesno.wtf/assets/no/14-cb78bf7104f848794808d61b9cd83eba.gif"
}
```

As a side-note, it doesn't always set `yes` or `no` as explained on the website:

> To make things more exciting, we return `{"answer": "maybe"}` every 10.000 time.

We can also pass a `force` parameter set to expected response. Yet, let postpone the implementation of this parameter in a future version of our YesNo application.

## Using Create React App

We are going to use create-react-app in this whole post. Create React App is a tool bootstrapping a pre-configured React project. For instance, it handles Hot Module Reload (HMR) allowing us to selectively reload a component we just changed instead of reloading the whole page.

``` sh
# install create-react-app globally
yarn add -g create-react-app

# bootstrap React application in `yesno` folder
create-react-app yesno
```

This command creates several files and folder. The most interesting is the `src` folder:

``` sh
src/
  ├── App.css
  ├── App.js
  ├── App.test.js
  ├── index.css
  ├── index.js
  ├── logo.svg
  └── registerServiceWorker.js
```

Main file of our application is the `App.js` file. It contains a single `render` method displaying our page. It is the file we are going to change in this tutorial.

To launch our application, we just need to execute:

``` sh
yarn start
```

It should then open a browser tab on `http://localhost:3000` with our current application:

<iframe src="http://www.marmelab.com" />

**Note:** if you are using some versionning control, do not forget to initialize it at this step. Even if this tool does a big amount of things by itself, it doesn't know the project should be versionned.

## Installing Jest

Jest is already installed with `create-react-app`. However, if we use a React project created from scratch, we would need to install it manually using the following command:

``` sh
# only for React app created from scratch
yarn add -D jest babel-jest
```

We installed an extra package in the previous command: `babel-jest`. Thanks to this package, Jest will use our `.babelrc` file to better understand JSX and ES6. We install these two dependencies as development (`-D`) dependencies, as they are used only for testing purposes.

By default, Jest looks for all files suffixed by `.spec.js` or `.test.js`. In current project, we have a `.test.js` suffixed file. So, no need of extra configuration. Note that Jest also takes into account all files found in `__tests__` folders.

To execute our tests, we may use:

``` sh
./node_modules/.bin/jest
```

However, with a `create-react-app` application, we don't have any `.babelrc` file at root level. Hence, we need to use the `react-script` wrapper to launch Jest correctly. Fortunately, `create-react-app` already uses this wrapper through the following command:

```
yarn test
```

Which produces the following output:

```
react-scripts test --env=jsdom

 PASS  src/App.test.js
  ✓ renders without crashing (24ms)
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.285s
```

We may achieve the same result using Jest binary directly in a React app created from scratch.

So our Jest is correctly installed and configured. Despite of a very long paragraph, there is no configuration to write in order to make Jest working. One of its promise is ~resolved~ kept!

## Applying Test-Driven Development on our App

### What is TDD?

We are now going to work on our application. We are going to use Test-Driven Development (TDD). This process ensures we do not forget to test any feature, and that we are testing them right. It consists of a four steps process:

1. Write a test to prove a feature – or a part of it – which does not exist yet works,
2. Launch it and see it fail,
3. Write the feature,
4. Launch the test and see it pass.

Then, we rince and repeat once our whole feature is finally done. Step 2 is really important. It is not rare indeed to write a test which always pass. Main example is writing a asynchronous test and to exit before waiting the end of it. Don't worry, we'll see an example later in this post.

### Writing Good Assertions

Based on our above mock-up, we basically need four things on our page: an input with a submit button for the question part, and a text with a picture for the answer one. Let's write some assertions we need to prove our mock-up is correctly implemented. Here is our updated `App.test.js` file:

``` js
it('should display a text input to fill question');
it('should display a submit button to send question to the Internet Gods');
it('should display Internet Gods answer in text format');
it('should display Internet Gods answer as a picture');
```

At this point, we just translated our product owner wishes (materialized as a backlog story) into automated test assertions.

A special care has to be brought on this part. Writing such assertions has several advantages. The most important one is the share of currently implemented business rules. When an agile project grows, it is not rare we have to implement some business rules contradicting some previous one. Having a clear understanding of why a test fails after a new feature implementation is fundamental to make a good decision about this conflict. That's why I strongly encourage to write some functional assertions (`should display Internet Gods answer in text format`) instead of technical one (`should display API answer in a title tag`). This way, we may share the test output directly with our product owner (even the non technical one), and they would be able to understand it without further explanations.

Granularity of our tests is also important. If we split finely all our test suite, we will localize precisely where our application breaks in case of failure. There is no trouble to split too much precisely assertions. The only disadvantage is for long bootstrap tests (think for instance to end-to-end tests). Having a lot of small tests would require too much overhead time (opening a fresh browser on a given URL, waiting for the page to load...). But in the case of unit tests, we should feel free to decompose our test suite as finely as we want.

### Prototyping our App
