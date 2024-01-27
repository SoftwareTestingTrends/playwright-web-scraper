const playwright = require("playwright");
const randomUseragent = require("random-useragent");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://github.com/topics/playwright";

const scrapeData = async (page) => {
  return page.$$eval("article.border", (repoCards) => {
    return repoCards.map((card) => {
      const [user, repo] = card.querySelectorAll("h3 a");
      const detail = card.querySelector("p");
      const formatText = (element) => element && element.innerText.trim();
      return {
        user: formatText(user),
        repo: formatText(repo),
        url: repo.href,
        detail: formatText(detail),
      };
    });
  });
};

const saveDataToFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("Data saved to:", filePath);
};

const main = async () => {
  try {
    const USER_AGENT = randomUseragent.getRandom();

    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage({ bypassCSP: true });
    await page.setDefaultTimeout(30000);
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto(BASE_URL);

    const repositories = await scrapeData(page);

    console.log("Repositories:", repositories);

    const filePath = path.join(__dirname, "data.json");
    saveDataToFile(filePath, repositories);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

main();
