// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
fs.writeFileSync('./data.json', JSON.stringify([]));
const fileData = require('./data.json');

async function scrapePosts() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/explore', { waitUntil: 'networkidle2', timeout: 60000 });
  let searchInput = await page.waitForSelector('input[placeholder="Search"]');
  let keywords = [
    'beautiful destinations',
    'places to visit',
    'places to travel',
    "places that don't feel real",
    'travel hacks',
    '#traveltok',
    '#wanderlust',
    '#backpackingadventures',
    '#luxurytravel',
    '#hiddengems',
    '#solotravel',
    '#roadtripvibes',
    '#travelhacks',
    '#foodietravel',
    '#sustainabletravel',
  ];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    await searchInput.type(keyword);
    await page.click('button[aria-label="Search"]');
    await page.waitForSelector('div#tabs-0-tab-search_video');
    await page.click('div#tabs-0-tab-search_video');
    await page.waitForSelector('xpath///*[@id="tabs-0-panel-search_video"]/div/div/div');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // (pagination)
    let prevHeight = -1;
    let maxScrolls = 5;
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let newHeight = await page.evaluate('document.body.scrollHeight');
      if (newHeight == prevHeight) {
        break;
      }
      prevHeight = newHeight;
      scrollCount += 1;
    }
    console.log(scrollCount);

    let allVideos = await page.$$('xpath///*[@id="tabs-0-panel-search_video"]/div/div/div');

    console.log(allVideos.length);

    for (let j = 0; j < allVideos.length; j++) {
      let video = allVideos[j];
      //   video data scraping
      const result = await page.evaluate((video) => {
        let video_url = video.querySelector('a')?.href;
        let video_caption = video.querySelector('div[data-e2e="search-card-video-caption"]')?.textContent;
        let author_username = video.querySelector('p[data-e2e="search-card-user-unique-id"]')?.textContent;
        return { video_url, video_caption, author_username };
      }, video);
      //   another page to scrape author
      let page2 = await browser.newPage();
      await page2.goto('https://www.tiktok.com/@' + result.author_username);
      let user = await page2.waitForSelector('h1[data-e2e="user-title"]');
      let username = await user.evaluate((el) => el?.textContent);
      let following = await page2.waitForSelector('strong[data-e2e="following-count"]');
      let following_count = await following.evaluate((el) => el?.textContent);
      let followers = await page2.waitForSelector('strong[data-e2e="followers-count"]');
      let follower_count = await followers.evaluate((el) => el?.textContent);
      let likes = await page2.waitForSelector('strong[data-e2e="likes-count"]');
      let like_count = await likes.evaluate((el) => el?.textContent);
      let author_info = {
        username,
        following_count,
        follower_count,
        like_count,
      };
      result.author_info = author_info;
      await page2.close();
      console.log(result);

      fileData.push(result);
      //   console.log(fileData);

      fs.writeFileSync('./data.json', JSON.stringify(fileData));
    }

    await searchInput.click({ clickCount: 3 });
  }
  await new Promise((resolve) => setTimeout(resolve, 20000));
  await browser.close();
}

scrapePosts();
