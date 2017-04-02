<!-- $theme: default -->

# I18N W2H R3T

## Internationalization With React

Jonathan Petitcolas - www.jonathan-petitcolas.com
API Hours - Clermont Ferrand, France - 2017/03/27

---

# Jonathan Petitcolas

## marmelab developer

<div style="display: flex; margin-bottom: 2rem; align-items: center;">
    <div style="flex: 0 0 200px">
        <a href="https://www.marmelab.com">
    	   <img src="./marmelab.png" alt="marmelab" />
        </a>
    </div>
    <div style="flex: 1 0 0">
    	<ul>
            <li>Agility FTW!</li>
            <li>Exciting technologies: Node, React, Go,  etc.</li>
            <li><a href="https://marmelab.com/blog/2016/11/21/free-for-charity.html">Free for charity!</a></li>
        </ul>
    </div>
</div>

More details on: <a href="https://www.twitter.com/marmelab">@marmelab</a> / www.marmelab.com

---

# Jonathan Petitcolas

## Open-Source Contributor

<a href="https://marmelab.com/admin-on-rest-demo">
	<img src="./admin-on-rest.png" alt="Admin on Rest Demo" title="Admin on Rest Demo" />
</a>

<p style="text-align: center;">
<small>
<strong>admin-on-rest:</strong> <a href="https://github.com/marmelab/admin-on-rest">marmelab/admin-on-rest</a></small>
</p>

---

# What Is Internationalization?

#### Translating sentences using dictionnary

```
"Hello world!" --FR--> "Bonjour le monde !"
```
#### Translating date and currencies format
```
"$199 on 2016/30/10" --FR--> "199 â‚¬ le 30/10/2016"
```

#### Translating numbers
```
"14,910.45 units" --FR--> "14 910,45 unitÃ©s"
```

---

# ARTE+7

<a href="http://www.arte.tv/guide/fr/plus7/">
	<img src="./arte+7.png" alt="ARTE+7" title="ARTE+7" />
</a>

---

<p style="text-align: center; margin-bottom: 2rem">
	<img src="./arte+7logo.png" alt="ARTE+7" />
</p>

* 5 different languages
* Symfony3 for server, React for client
* Server-side uses Twig `trans` filter (isomorphic is coming)
* Client-side uses [Airbnb Polyglot](http://airbnb.io/polyglot.js/)

---

# Using Polyglot.js

``` js
import Polyglot from 'node-polyglot';

const locale = 'fr';
const phrases = {
  fullscreen: 'Voir en plein écran',
  views: '%{smart_count} vue |||| %{smart_count} vues',
};

const polyglot = new Polyglot({ locale, phrases });

// Voir en plein écran
console.log(polyglot.t('fullscreen');

// 42 vues
console.log(polyglot.t('views', { smart_count: 42 }));
```
---

# What About a Real World App?

<p style="text-align: center;">
	<img src="./tutorial-versus-reality.png" alt="Tutorial vs Reality" />
</p>

---

# Cascading props? So boring...

---

# Context to the Rescue!

> In some cases, you want to pass data through the component tree without having to pass the props down manually at every level. You can do this directly in React with the powerful "context" API.

Source: [React official docs](https://facebook.github.io/react/docs/context.html)

---

# Context is Experimental!
> If you want your application to be stable, don't use context. It is an experimental API and it is likely to break in future releases of React.

Source: [React (same) official docs](https://facebook.github.io/react/docs/context.html)

---

![Should I use React Context?](./context.jpg)

Source: [@dan_abramov](https://twitter.com/dan_abramov/status/749715530454622208)

---

# Using Context via a Provider
* Declare `getChildContext` method,
* Define `childContextTypes`,
* Render component children.

---

# I Promised Dan to Write an HOC...

But I don't even know what it is!

> A higher-order component (HOC) is a function that takes a component and returns a new component.

<br />

``` js
const EnhancedComponent = hoc(Component);
```

---

# Using `recompose`

> Recompose is a React utility belt for function components and higher-order components. Think of it like lodash for React.

Source: [recompose repository](https://github.com/acdlite/recompose)

---

# Any Questions?

---

# Thanks!

* GitHub repository: [jpetitcolas/react-i18n-sample](https://github.com/jpetitcolas/react-i18n-sample)
* Blog post (soon): [How-to implement Polyglot on a React App?](#)
* Further questions: [@Sethpolma](https://www.twitter.com/Sethpolma)