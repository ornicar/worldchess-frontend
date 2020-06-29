// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// const gameUrl = 'http://localhost:4201';
const gameUrl = 'https://chess-game.dev.worldchess.com';
// const gameUrl = '/arena';
const shopUrl = 'https://shop.worldchess.com';
const newsLink = "https://worldchess.com/news";

export const environment = {
  production: false,
  authServer: 'https://wchess.dev39.ru/auth',
  restServer: 'https://wchess.dev39.ru/rest',
  facebookRedirect: 'http://localhost:4200/verify/facebook',
  facebookAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_FACEBOOK_KEY'],
  twitterAppId: buildEnvironments['DJANGO_SOCIAL_AUTH_TWITTER_KEY'],
  stripeKey: buildEnvironments['STRIPE_SECRET_KEY'],
  endpoint: 'https://dev.worldchess.com/api',
  applicationUrl: 'https://dev.worldchess.com',
  // applicationUrl: 'http://localhost:4200',
  gameUrl,
  shopUrl,
  newsLink,
  newsUrl: 'https://news.worldchess.com/wp-json/wp/v3',
  socket: 'wss://ws.dev.worldchess.com/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london',
  debugger_on: true,
  staticNews: {
    armageddon: 1408,
  },
  pro_plan_stripe_id: 'pro-plan-eur',
  premium_plan_stripe_id: 'premium-plan',
  fide_id_plan_stripe_id: 'fide-id-plan',
  kaspersky_script_id: '90127',
  mainMenu:  [
    {title: 'News', link: 'https://worldchess.com/news', blank: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'News', null, null]},
    {title: 'Watch', link: '/main',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Watch', null, null]},
    {title: 'Play', link: gameUrl, blank: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Play', null, null]},
    {title: 'Broadcast', link: '/main', blank: true, external: false,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Broadcast', null, null]},
    {title: 'Shop', link: shopUrl, blank: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Shop', null, null]},
    {title: 'Franchise', link: '/main',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Franchise', null, null]},
  ],
  gamingMenu: [
    {title: 'Home', link: '/arena',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Arena', null, null]},
    {title: 'single game', link: '/arena/singlegames',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Single games', null, null]},
    {title: 'tournaments', link: '/arena/tournaments',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Tournaments', null, null]},
    {title: 'ratings', link: '/ratings', blank: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Ratings', null, null]},
    {title: 'shop', link: shopUrl, blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Shop', null, null]},
    {title: 'worldchess', link: '/', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Worldchess', null, null]},
    {title: 'FIDE', link: 'http://www.fide.com', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'FIDE', null, null]},
  ]
};
