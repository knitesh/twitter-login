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

## Usage

To start twitter Login process

```js
await twitter.login()
```

To get user details

```js
await twitter.callback(auth, tokenSecret)
```

## Sample Express app

```js
const express = require('express')
const session = require('express-session')
const TwitterLogin = require('twitter-login')

const app = express()
const port = 9000

const sessionConfig = {
  user: null,
  tokenSecret: null,
  secret: 'keyboard cat',
}

app.use(session(sessionConfig))

// get consumer key and consumer secret from Twitter App setting
const twitter = new TwitterLogin({
  consumerKey: '<your api key>',
  consumerSecret: '<your api secret key>',
  callbackUrl: 'http://localhost:$port/twitter/auth/userToken',
})

// Route where user will get directed on clicking on Login button
app.get('/twitter/auth', async (req, res) => {
  try {
    const result = await twitter.login()
    // Save the OAuth token secret for use in your /twitterauth/userToken Callback route
    req.session.tokenSecret = result.tokenSecret
    // Redirect to the /twitterauth/userToken route, with the OAuth responses as query params
    res.redirect(result.url)
  } catch (err) {
    // Handle Error here
    res.send('Twitter login error.')
  }
})

// Callback Route to retreive user auth token and secret
// This needs to be whitelisted in your twitter app
app.get('/twitter/auth/userToken', async (req, res) => {
  try {
    const oAuthParam = {
      oauth_token: req.query.oauth_token,
      oauth_verifier: req.query.oauth_verifier,
    }

    // call function passing Auth and Token Secret
    const userInfo = await twitter.callback(
      oAuthParam,
      req.session.tokenSecret,
    )
    // Delete the tokenSecret securely
    delete req.session.tokenSecret
    // Add User Info to your session
    req.session.user = userInfo
    // Redirect to route that can extract user detail
    res.redirect('/')
  } catch (err) {
    // Handle Error here
    res.send('Twitter login error.')
  }
})

app.get('/', (req, res) => {
  const _user = req.session && req.session.user
  if (_user) {
    res.send(JSON.stringify(_user))
  } else {
    res.send('Login with Twitter -http://localhost:9000/twitter/auth')
  }
})

app.listen(port, () => {
  console.log('Example app listening at http://localhost:${port}')
})
```
