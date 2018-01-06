---
layout: post
title: "Creating JSON Web Token in JavaScript"
excerpt: "One of the best way to secure an API is JSON Web Tokens. As understanding a concept passes by experimenting it, here is a post describing how to forge such a token in JavaScript."
illustration: "/img/posts/jsonwebtoken/fiber-optic-globe.jpg"
illustration_thumbnail: "/img/posts/jsonwebtoken/fiber-optic-globe-thumbnail.jpg"
illustration_title: "Fiber Optic Globe, by JaredZammit"
illustration_link: "https://flic.kr/p/5vuWZz"
---

I challenged myself during last weeks to implement an authentication on a freshly created API. After digging around, I found that one of the best solution would be JSON Web Tokens. As understanding a concept passes by experimenting it, here is a post describing how to forge such a token in JavaScript.

## What is JSON Web Token (JWT)?

JSON Web Token (JWT) is an easy way to secure an API. When a user authenticates first on a server, using for instance a standard login form, the server creates a token. This token includes some personal data, such as username or email address. Then, this token is signed server-side (to prevent token integrity), and sent back to the user. Within each next request, user sends the token to establish emitter identity.

```

Client application                                            API
    --------                                              -----------
        |                                                      |
        |                   GET /api/employees                 |
        |----------------------------------------------------->|
        |                     403 Forbidden                    |
        |<-----------------------------------------------------|
        |                                                      |
        |                                                      |
        |                 POST /api/authenticate               |
        |     { login: "john.doe", password: "password" }      |
        |----------------------------------------------------->|
        |                      200 Success                     |
        |             { token: "my.personal.token" }           |
        |<-----------------------------------------------------|
        |                                                      |
        |                                                      |
        |                 GET /api/employees                   |
        | Header { "Authorization: Token "my.personal.token" } |
        |----------------------------------------------------->|
        |                      200 Success                     |
        |<-----------------------------------------------------|
        |                                                      |
```

JSON Web Token is composed of three main parts:

* Header: normalized structure specifying how token is signed (generally using HMAC SHA-256 algorithm)
* Free set of claims embedding whatever you want: username, email, roles, expiration date, etc.
* Signature ensuring data integrity

## Creating a JSON Web Token in JavaScript

JSON Web Tokens may be resumed by the following equations:

```
unsignedToken = base64url(header) + "." + base64url(data)
JWT = unsignedToken + "." + base64url(HMAC256(unsignedToken, secret))
```

### Base64 URL encoding

Note I wrote `base64url`, not `base64`. There is indeed [two small differences](https://tools.ietf.org/html/rfc4648#page-7) between these two encodings:

* There is no `=` padding at the end,
* `+` and `/` characters are replaced by `-` and `_` respectively.

Implementing such a function can be achieved in JavaScript:

``` js
function base64url(source) {
  // Encode in classical base64
  encodedSource = CryptoJS.enc.Base64.stringify(source);

  // Remove padding equal characters
  encodedSource = encodedSource.replace(/=+$/, '');

  // Replace characters according to base64url specifications
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');

  return encodedSource;
}
```

I use [CryptoJS library](https://github.com/evanvosberg/crypto-js) to achieve the standard `base64` encoding. This is a useful library whenever you want to assume some cryptographic, hashing or encoding tasks. This is perfectly the case, with the incoming HMAC signature.

To make this function work, you have to specify source as an array of UTF-8 bytes. It can easily be achieved using another utility function of CryptoJS: `Utf8.parse`.

``` js
var source = "Hello!";

// 48 65 6c 6c 6f 21
console.log(CryptoJS.enc.Utf8.parse(source).toString());
```

This extra call is not included into the `base64url` function for signature commodity. But you are going to notice it later.

### Creating our unsigned token

We can now encode our header and claims. Header is normalized, and contains two `alg` and `typ` fields indicating the used signature algorithm.

``` js
var header = {
  "alg": "HS256",
  "typ": "JWT"
};

var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
var encodedHeader = base64url(stringifiedHeader);

var data = {
  "id": 1337,
  "username": "john.doe"
};

var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
var encodedData = base64url(stringifiedData);

var token = encodedHeader + "." + encodedData;
```

After executing this first snippet, we got our unsigned token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMzNywidXNlcm5hbWUiOiJqb2huLmRvZSJ9
```

### Signing our token

Finally, to ensure our token integrity, we should sign it with a secret. Signature is the HMAC SHA-256 (as specified in header) of our current token. And as usual, we should `base64url` encode it.

``` js
var secret = "My very confidential secret!";

var signature = CryptoJS.HmacSHA256(token, secret);
signature = base64url(signature);

var signedToken = token + "." + signature;
```
No need of `Utf8.parse` the output of `HmacSHA256`. It is indeed already an array of UTF-8 characters. That's why I didn't include this method in our `base64url` function.

Of course, you shouldn't share your secret client-side. Tokens should be forged server-side. Otherwise, everyone would be able to modify your tokens and pass them as genuine.

If you execute this code, your signed token should look like:

<div class="highlight">
	<pre style="overflow-wrap: break-word;"><code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMzNywidXNlcm5hbWUiOiJqb2huLmRvZSJ9.EvTdOJSfbffGHLyND3BMDwWE22zUBOCRspPZEHlNEw</code></pre>
</div>

There is plenty of libraries dealing with JWT. Creating tokens by hand is only a good idea to learn how they work. On a real project, don't reinvent the wheel and use existing third-part tools, such as [LexikJWTAuthenticationBundle](https://github.com/lexik/LexikJWTAuthenticationBundle) for Symfony2 users or [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) for Node.js developers.

The full code of this post is available as a [CodePen](http://codepen.io/jpetitcolas/pen/zxGxKN).

Another interesting resource: [JWT.io](http://jwt.io/)
