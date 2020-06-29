// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  authServer: 'https://wchess.dev39.ru/auth',
  restServer: 'https://wchess.dev39.ru/rest',
  facebookRedirect: 'http://localhost:4200/verify/facebook',
  facebookAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_FACEBOOK_KEY'],
  twitterAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_TWITTER_KEY'],
  stripeKey: buildEnvironments['STRIPE_SECRET_KEY'],
  endpoint: 'https://chess.usetech.ru/api',
  applicationUrl: 'https://chess.usetech.ru',
  newsUrl: 'https://setka-chess.usetech.ru/wp-json/wp/v3',
  socket: 'wss://chess.usetech.ru/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london'
};
