import { browser, element, by } from 'protractor';


describe('generate tournament', () => {

  beforeEach(() => {
    browser.get('/admin/login/?next=/admin/');
  });

  it('generate tournament', () => {
    /*const userID = element(by.id('id_username'));
    const passwordID = element(by.id('id_password'));
    userID.sendKeys('dev@usetech.ru');
    passwordID.sendKeys('1qaz@WSX3edc');
    element(by.css('.submit-row > input')).click();

    expect(browser.getCurrentUrl())
      .toEqual(browser.baseUrl + '/arena');*/
  });

});
