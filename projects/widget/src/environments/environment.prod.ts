export const environment = {
  production: true,
  authServer: 'https://api.worldchess.com/auth',
  restServer: 'https://api.worldchess.com/rest',
  // authServer: 'https://wchess.dev39.ru/auth',
  // restServer: 'https://wchess.dev39.ru/rest',
  facebookRedirect: 'https://worldchess.com/verify/facebook',
  facebookAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_FACEBOOK_KEY'],
  twitterAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_TWITTER_KEY'],
  stripeKey: buildEnvironments['STRIPE_SECRET_KEY'],
  endpoint: 'https://worldchess.com/api',
  backendUrl: 'https://worldchess.com',
  newsUrl: 'https://news.worldchess.com/wp-json/wp/v3',
  socket: 'wss://worldchess.com:9000/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london'
};
