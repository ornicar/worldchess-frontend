export const environment = {
  production: false,
  // authServer: 'https://test.worldchess.com/auth',
  // restServer: 'https://test.worldchess.com/rest',
  authServer: 'https://wchess.dev39.ru/auth',
  restServer: 'https://wchess.dev39.ru/rest',
  facebookRedirect: 'https://chess3.usetech.ru/verify/facebook',
  facebookAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_FACEBOOK_KEY'],
  twitterAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_TWITTER_KEY'],
  stripeKey: buildEnvironments['STRIPE_SECRET_KEY'],
  endpoint: 'https://chess3.usetech.ru/api',
  backendUrl: 'https://chess3.usetech.ru',
  newsUrl: 'https://news.worldchess.com/wp-json/wp/v3',
  socket: 'wss://chess3.usetech.ru/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london'
};
