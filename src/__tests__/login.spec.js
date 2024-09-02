const {By, Builder, Browser} = require('selenium-webdriver');
const assert = require("assert");

(async function loginTest() {
  let driver;
  
  try {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.get('http://localhost:3000/login');
  
    let title = await driver.getTitle();
    assert.equal("Logowanie", title);
    await driver.manage().setTimeouts({implicit: 1000});
    // Check if the login page loads
  
    let loginEmail = await driver.findElement(By.id('email'));
    let loginPassword = await driver.findElement(By.id('password'));
    let submitButton = await driver.findElement(By.css('button'));
  
    await loginEmail.sendKeys('demo@user.com');
    await loginPassword.sendKeys('demoUser');
    await submitButton.click();
    await driver.manage().setTimeouts({implicit: 10000});
    // Login

    let message = await driver.findElement(By.css('table'));
    let table = await message.getText();
    let tableExpected="Name Day Amount Invoice";
    assert.equal(tableExpected, table.substring(0, tableExpected.length));
    // Check if table is loaded after successful login

    let titleLogged = await driver.getTitle();
    assert.equal("Rozrachunki", titleLogged);
    // Check if the main page title is right

    console.log("Login test passed");
  } catch (e) {
    console.log(e)
  } 
  finally {
    await driver.quit();
  }
}())