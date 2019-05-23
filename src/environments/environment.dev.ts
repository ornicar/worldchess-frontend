export const environment = {
  production: false, // @todo before deply.
  authServer: 'https://wchess.dev39.ru/auth',
  restServer: 'https://wchess.dev39.ru/rest',
  facebookRedirect: 'https://chess.usetech.ru/verify/facebook',
  facebookAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_FACEBOOK_KEY'],
  twitterAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_TWITTER_KEY'],
  stripeKey: buildEnvironments['STRIPE_SECRET_KEY'],
  endpoint: 'https://chess.usetech.ru/api',
  backendUrl: 'https://chess.usetech.ru',
  newsUrl: 'https://setka-chess.usetech.ru/wp-json/wp/v3',
  socket: 'wss://chess.usetech.ru/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london'
};
