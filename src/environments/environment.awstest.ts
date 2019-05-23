export const environment = {
  production: true,
  // authServer: 'https://test.worldchess.com/auth',
  // restServer: 'https://test.worldchess.com/rest',
  authServer: 'https://wchess.dev39.ru/auth',
  restServer: 'https://wchess.dev39.ru/rest',
  facebookRedirect: 'https://chessawstest.usetech.ru/verify/facebook',
  // stripeKey: 'pk_live_NntOD2dWJybisRNTHdvT20oK',
  facebookAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_FACEBOOK_KEY'],
  twitterAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_TWITTER_KEY'],
  stripeKey: buildEnvironments['STRIPE_SECRET_KEY'],
  endpoint: 'https://chessawstest.usetech.ru/api',
  backendUrl: 'https://chessawstest.usetech.ru',
  newsUrl: 'https://setka-chess.usetech.ru/wp-json/wp/v3',
  socket: 'wss://chessawstest.usetech.ru:9000/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london'
};
