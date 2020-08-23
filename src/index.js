const axios = require('axios')
//https://github.com/ddo/oauth-1.0a
const OAuth = require('oauth-1.0a')
const crypto = require('crypto')
const querystring = require('querystring')

const {
  TWITTER_TOKEN_URL,
  TWITTER_AUTH_URL,
  TWITTER_ACCESS_TOKEN_URL,
} = require('./endpoints')

const validateTwitterAppConfig = (config) => {
  if (!config.consumerKey || typeof config.consumerKey !== 'string') {
    throw new Error('Invalid or missing `consumerKey` option')
  }
  if (
    !config.consumerSecret ||
    typeof config.consumerSecret !== 'string'
  ) {
    throw new Error('Invalid or missing `consumerSecret` option')
  }
  if (!config.callbackUrl || typeof config.callbackUrl !== 'string') {
    throw new Error('Invalid or missing `callbackUrl` option')
  }
}

const hashFunctionSha1 = (base_string, key) =>
  crypto.createHmac('sha1', key).update(base_string).digest('base64')

function TwitterLogin(twitterAppConfig) {
  // Extract required App Config
  const {
    consumerKey,
    consumerSecret,
    callbackUrl,
  } = twitterAppConfig

  // initialize oAUTH
  const oauth = OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) =>
      hashFunctionSha1(baseString, key),
  })

  // Check all required options exist for calling Twitter API
  validateTwitterAppConfig(twitterAppConfig)

  // request oAuth
  this.login = async () => {
    const requestData = {
      url: TWITTER_TOKEN_URL,
      method: 'POST',
      data: {
        oauth_callback: callbackUrl,
      },
    }

    const option = {
      url: requestData.url,
      method: requestData.method,
      form: requestData.data,
      headers: oauth.toHeader(oauth.authorize(requestData)),
    }

    return new Promise(async (resolve, reject) => {
      const responseHandler = (data) => {
        const {
          oauth_token: oAuthToken,
          oauth_token_secret: tokenSecret,
          oauth_callback_confirmed: oAuthCallbackConfirmed,
        } = querystring.parse(data.toString())

        if (oAuthCallbackConfirmed !== 'true') {
          reject(
            new Error(
              'Missing `oauth_callback_confirmed` parameter in response',
            ),
          )
        }

        const url = `${TWITTER_AUTH_URL}?${querystring.stringify({
          oauth_token: oAuthToken,
        })}`

        resolve({ tokenSecret, url })
      }
      // actuall call to twitter
      try {
        const { data } = await axios(option)
        responseHandler(data)
      } catch (err) {
        reject(err)
      }
    })
  }

  // get Access Token
  this.callback = async (params, tokenSecret) => {
    const { oauth_token: token, oauth_verifier: verifier } = params

    return new Promise(async (resolve, reject) => {
      if (
        typeof params.denied === 'string' &&
        params.denied.length > 0
      ) {
        const err = new Error('User denied login permission')
        err.code = 'USER_DENIED'
        reject(err)
      }
      if (
        typeof params.oauth_token !== 'string' ||
        params.oauth_token.length === 0
      ) {
        reject(
          new Error(
            'Invalid or missing `oauth_token` parameter for twitter login callback',
          ),
        )
      }
      if (
        typeof params.oauth_verifier !== 'string' ||
        params.oauth_verifier.length === 0
      ) {
        reject(
          new Error(
            'Invalid or missing `oauth_verifier` parameter for twitter login callback',
          ),
        )
      }
      if (
        typeof tokenSecret !== 'string' ||
        tokenSecret.length === 0
      ) {
        reject(
          new Error(
            'Invalid or missing `tokenSecret` argument for login callback',
          ),
        )
      }

      const requestData = {
        url: TWITTER_ACCESS_TOKEN_URL,
        method: 'POST',
        data: {
          oauth_token: token,
          oauth_token_secret: tokenSecret,
          oauth_verifier: verifier,
        },
      }

      const option = {
        url: requestData.url,
        method: requestData.method,
        form: requestData.data,
        headers: oauth.toHeader(oauth.authorize(requestData)),
      }

      const responseHandler = (data) => {
        const {
          oauth_token: userToken,
          oauth_token_secret: userTokenSecret,
          screen_name: userName,
          user_id: userId,
        } = querystring.parse(data.toString())

        resolve({
          userName,
          userId,
          userToken,
          userTokenSecret,
        })
      }
      // actuall call to twitter
      try {
        const { data } = await axios(option)
        responseHandler(data)
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = TwitterLogin
