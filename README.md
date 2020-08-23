[![npm-version](https://img.shields.io/npm/v/twitter-login)](https://www.npmjs.com/package/twitter-login)
[![GitHub issues](https://img.shields.io/github/issues/knitesh/twitter-login.svg)](https://github.com/knitesh/twitter-login/issues)
[![GitHub forks](https://img.shields.io/github/forks/knitesh/twitter-login.svg)](https://github.com/knitesh/twitter-login/network/members)
[![GitHub license](https://img.shields.io/github/license/knitesh/twitter-login)](https://github.com/knitesh/twitter-login/blob/master/LICENSE)

## Twitter Login. OAuth 1.0 flow

### Selling Point

This package can be used to get Twitter user access token using oAuth 1.0 flow.

**Implements a Client-Side flow for login with twitter, similar to one provided by Facebook and Google.**
**This can be used to get User Access Token to make API calls to Twitter where User Context is required**

# Installation:

- Clone as a Git repository
  ```sh
  git clone https://github.com/knitesh/twitter-login.git
  ```
- Install as a node_module

  ```sh
  npm i twitter-login --save

  OR

  npm install twitter-login --save
  ```

## Sample Usage - Express APP

```js
const express = require("express");
const session = require("express-session");
const TwitterLogin = require("twitter-login");

const app = express();
const port = 9000;

const sessionConfig = {
  user: null,
  tokenSecret: null,
  secret: "keyboard cat",
};

app.use(session(sessionConfig));

const twitter = new TwitterLogin({
  consumerKey: "<your api key>",
  consumerSecret: "<your api secret key>",
  callbackUrl: "http://localhost:$port/twitter/auth/userToken",
});

app.get("/twitter/auth", async (req, res) => {
  try {
    const result = await twitter.login();
    // Save the OAuth token secret for use in your /twitter/callback route
    req.session.tokenSecret = result.tokenSecret;
    console.log(result);
    // Redirect to the /twitter/callback route, with the OAuth responses as query params
    res.redirect(result.url);
  } catch (err) {
    // Handle Error here
    res.send("Twitter login error.");
  }
});

app.get("/twitter/auth/userToken", async (req, res) => {
  try {
    const oAuthParam = {
      oauth_token: req.query.oauth_token,
      oauth_verifier: req.query.oauth_verifier,
    };
    const userInfo = await twitter.callback(
      oAuthParam,
      req.session.tokenSecret
    );
    // Delete the tokenSecret securely
    delete req.session.tokenSecret;

    req.session.user = userInfo;

    // Redirect to whatever route that can handle your new Twitter login user details!
    res.redirect("/");
  } catch (err) {
    // Handle Error here
    res.send("Twitter login error.");
  }
});

app.get("/", (req, res) => {
  const _user = req.session && req.session.user;
  if (_user) {
    res.send(JSON.stringify(_user));
  } else {
    res.send("Login with Twitter");
  }
});

app.listen(port, () => {
  console.log("Example app listening at http://localhost:${port}");
});
```
