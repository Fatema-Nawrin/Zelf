const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
require('dotenv').config();

async function likePost(url) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com');
  await login(page);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForSelector('xpath///*[@id="main-content-video_detail"]/div/div[2]/div[1]/div[1]/div[1]/div[4]/div[2]/button[1]');
  await page.click('xpath///*[@id="main-content-video_detail"]/div/div[2]/div[1]/div[1]/div[1]/div[4]/div[2]/button[1]/span/div/div/svg');

  //   await new Promise((resolve) => setTimeout(resolve, 30000));

  await browser.close();
}

async function login(page) {
  await page.waitForSelector('[data-e2e="top-login-button"]');
  await page.click('[data-e2e="top-login-button"]');
  await page.waitForSelector('xpath///*[contains(text(), "Use phone / email / username")]');
  await page.click('xpath///*[contains(text(), "Use phone / email / username")]');
  await page.waitForSelector('xpath///*[contains(text(), "Log in with email or username")]');
  await page.click('xpath///*[contains(text(), "Log in with email or username")]');
  await page.type('[name="username"]', process.env.email);
  await page.type('[type="password"]', process.env.password);
  await page.click('button[data-e2e="login-button"]');
  await new Promise((resolve) => setTimeout(resolve, 30000));
}

// likePost('https://www.tiktok.com/@mddyelrck/video/7236784024314744070?q=%23wanderlust&t=1728111974633');
