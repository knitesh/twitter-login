const TWITTER_OAUTH_BASE_URL = 'https://api.twitter.com/oauth'

const TWITTER_TOKEN_URL = `${TWITTER_OAUTH_BASE_URL}/request_token`
const TWITTER_AUTH_URL = `${TWITTER_OAUTH_BASE_URL}/authenticate`
const TWITTER_ACCESS_TOKEN_URL = `${TWITTER_OAUTH_BASE_URL}/access_token`

module.exports = {
  TWITTER_TOKEN_URL,
  TWITTER_AUTH_URL,
  TWITTER_ACCESS_TOKEN_URL,
}
