
const gameUrl = 'https://arena.myfide.net';
const newsLink = 'https://worldchess.com/news';
const shopUrl = 'https://shop.worldchess.com';
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
  applicationUrl: 'https://worldchess.com',
  gameUrl,
  newsLink,
  shopUrl,
  newsUrl: 'https://news.worldchess.com/wp-json/wp/v3',
  socket: 'wss://ws.worldchess.com:9000/ws',
  tournamentOlympiadId: 6,
  tournamentLondonSlug: 'london',
  staticNews: {
    armageddon: 1408,
  },
  pro_plan_stripe_id: 'pro-plan-eur',
  premium_plan_stripe_id: 'premium-plan',
  fide_id_plan_stripe_id: 'fide-id-plan',
  kaspersky_script_id: '90126',
  debugger_on: false,

  mainMenu:  [
    {title: 'Home', link: '/arena',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Arena', null, null]},
    {title: 'FIDE Online Arena', link: '/arena/singlegames',
      gtagParams: ['wchCross', 'Header', 'Menu', 'Singlegames', null, null]},
    {title: 'ratings', link: '/ratings', blank: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Ratings', null, null]},
    {title: 'shop', link: 'https://shop.worldchess.com', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Shop', null, null]},
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
    {title: 'shop', link: 'https://shop.worldchess.com', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Shop', null, null]},
    {title: 'worldchess', link: '/', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Worldchess', null, null]},
    {title: 'FIDE', link: 'http://www.fide.com', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'FIDE', null, null]},
  ]
};
