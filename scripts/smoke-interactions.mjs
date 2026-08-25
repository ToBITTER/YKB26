import {chromium} from "playwright-core";
const executablePath=process.env.BALLER_BROWSER??"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base=process.env.BALLER_BASE_URL??"http://127.0.0.1:3100";
const browser=await chromium.launch({executablePath,headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});const checks=[];
async function check(name,work){await work();checks.push(name)}
try{
 await check("home CTA navigates",async()=>{await page.goto(base);await page.getByRole("link",{name:/play now/i}).click();await page.waitForURL(/\/play\/whos-that-baller/)});
 await check("quiz answer reacts",async()=>{const question=await page.locator(".question-card h1").textContent();await page.locator(".answers button").first().click();await page.waitForTimeout(1400);const changed=(await page.locator(".question-card h1").textContent())!==question||await page.locator(".result").count();if(!changed)throw new Error("Question did not advance")});
 await check("mobile navigation works",async()=>{await page.locator('.bottom-nav a[href="/"]').click();await page.waitForURL(base+"/");await page.locator('.bottom-nav a[href="/play"]').click();await page.waitForURL(base+"/play")});
 await check("club card opens filtered game",async()=>{await page.goto(base+"/clubs");await page.locator(".club-grid a").first().click();await page.waitForURL(/club=Arsenal/);if(!await page.locator(".answers button").count())throw new Error("Club game has no answers")});
 await check("The XI completes",async()=>{await page.goto(base+"/play/the-xi");const players=page.locator(".squad-list button");for(let i=1;i<=11;i++)await players.nth(i).click();const submit=page.getByRole("button",{name:/complete squad/i});if(await submit.isDisabled())throw new Error("Valid XI remained disabled");await submit.click();await page.locator(".result").waitFor()});
 console.log(`Interaction smoke passed: ${checks.join(", ")}`);
}finally{await browser.close()}
