export const environmentMenu = {
  mainMenu:  [
    {title: 'FIDE Online Arena', link: '/singlegames', mainApp: false,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Singlegames', null, null]},
    {title: 'ratings', link: '/ratings', blank: true, mainApp: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Ratings', null, null]},
    {title: 'shop', link: 'https://shop.worldchess.com', blank: true, external: true, mainApp: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Shop', null, null]},
  ],
  gamingMenu: [
    {title: 'single game', link: '/singlegames', mainApp: false,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Single games', null, null]},
    {title: 'tournaments', link: '/tournaments', mainApp: false,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Tournaments', null, null]},
    {title: 'ratings', link: '/ratings', blank: true, mainApp: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Ratings', null, null]},
    {title: 'shop', link: 'https://shop.worldchess.com', blank: true, external: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Shop', null, null]},
    {title: 'World Chess', link: '/', blank: true, external: true, mainApp: true,
      gtagParams: ['wchCross', 'Header', 'Menu', 'World Chess', null, null]},
    {title: 'FIDE', link: 'http://www.fide.com', blank: true, external: true, mainApp: false,
      gtagParams: ['wchCross', 'Header', 'Menu', 'FIDE', null, null]},
    {title: 'Old Interface', link: 'http://old-arena.myfide.net', blank: true, external: true, mainApp: false,
      gtagParams: ['wchCross', 'Header', 'Menu', 'Old interface', null, null]},
  ]
};
