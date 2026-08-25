import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const executablePath = process.env.BALLER_BROWSER ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BALLER_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath, headless: true });
await mkdir("artifacts/mobile", { recursive: true });
const routes = ["/", "/play", "/clubs", "/competitions", "/play/whos-that-baller", "/profile", "/account"];

for (const width of [320, 390, 430]) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const audit = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      offenders: [...document.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > innerWidth + 1 || rect.left < -1;
      }).slice(0, 12).map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim().slice(0, 50), rect: element.getBoundingClientRect().toJSON() })),
      clippedText: [...document.querySelectorAll("h1,h2,h3,p,strong,span,small,button,a")].filter((element) => element.childElementCount === 0 && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)).slice(0, 12).map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim().slice(0, 70), client: [element.clientWidth, element.clientHeight], scroll: [element.scrollWidth, element.scrollHeight] })),
    }));
    console.log(JSON.stringify({ width, route, ...audit }));
    await page.screenshot({ path: `artifacts/mobile/${width}-${route.replaceAll("/", "-") || "home"}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
