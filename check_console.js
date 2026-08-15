import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    console.error(`[BROWSER EXCEPTION]: ${err.message}`);
    console.error(err.stack);
  });

  console.log("Navigating to https://flourishing-kitsune-e3810c.netlify.app ...");
  await page.goto("https://flourishing-kitsune-e3810c.netlify.app", { waitUntil: "networkidle" });
  
  console.log("Waiting 5 seconds for WebGL scene setup...");
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log("Done.");
}

run().catch(console.error);
