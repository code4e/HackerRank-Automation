const puppeteer = require('puppeteer');
const minimist = require('minimist');
let args = minimist(process.argv);
//node Hackerrank_Automation.js --url=https://www.hackerrank.com --source=config.json
const fs = require("fs");
let configJSO = JSON.parse(fs.readFileSync(args.source, "utf-8"));


(async () => {
  const browser = await puppeteer.launch({
    slowMo: 10,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  await page.goto(args.url);


  await page.waitForSelector("li#menu-item-2887>a");
  await page.click("li#menu-item-2887>a");


  await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
  await page.click("a[href='https://www.hackerrank.com/login']");



  await page.waitForSelector("form");

  const username = await page.waitForSelector("#input-1");
  await username.type(configJSO.username, {
    delay: 30
  });


  const password = await page.waitForSelector("#input-2");
  await password.type(configJSO.password, {
    delay: 30
  });

  await page.click("form > div.form-item.clearfix > button > div > span");

  const compete = await page.waitForSelector("a[data-analytics='NavBarContests']");
  await compete.click("a[data-analytics='NavBarContests']");

  const manageContests = await page.waitForSelector("a[href='/administration/contests/']");
  await manageContests.click("a[href='/administration/contests/']");


  await page.waitForSelector("a[data-attr1='Last']");
  const maxPages = await page.$eval("a[data-attr1='Last']", el => el.getAttribute('data-attr8'));

  await page.evaluate(() => {
    location.reload(true)
  });


  await moveToNextPage(configJSO.moderator, page, browser, maxPages);

  await page.waitFor(1000);
  await browser.close();
})();



async function moveToNextPage(moderator, page, browser, maxPages) {


  for (let i = 0; i < parseInt(maxPages); i++) {

    console.log(i);
    await handleOneContestOnCurrentPage(moderator, page, browser);
    const nextPageLink = await page.waitForSelector("a[data-attr1='Right']");
    await nextPageLink.click("a[data-attr1='Right']");

  }

}

async function handleOneContestOnCurrentPage(moderator, page, browser) {
  await page.waitForSelector("a.backbone.block-center");
  let curls = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('a.backbone.block-center'),
      (element) => element.getAttribute('href')
    )
  );
  await page.waitFor(500);

  for (let i = 0; i < curls.length; i++) {

    let currentContestPage = await browser.newPage();

    await currentContestPage.goto(args.url + curls[i]);
    await currentContestPage.bringToFront();
    await currentContestPage.waitFor(500);


    const moderatorsTab = await currentContestPage.waitForSelector("li[data-tab='moderators']");
    await moderatorsTab.click("li[data-tab='moderators']");

    await currentContestPage.waitFor(500);

    const addModerator = await currentContestPage.waitForSelector("#moderator");
    await addModerator.type(moderator, {
      delay: 20
    });

    await currentContestPage.waitFor(500);
    await currentContestPage.keyboard.press('Enter');


    await currentContestPage.close();
    await currentContestPage.waitFor(500);
  }
}