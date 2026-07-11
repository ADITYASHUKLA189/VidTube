const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Navigate to the watch page of an arbitrary video (we can use the ID from the screenshot or just the homepage)
  // Let's just go to the homepage and click the first video, or go to the exact URL.
  // Wait, let's just go to localhost:5173 to see if there's any error, and then go to localhost:5173/watch/6a4e87ac730204ac9aa9a719 (the previous ID that crashed).
  
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Navigating to the previous crashing video...');
  await page.goto('http://localhost:5173/watch/6a4e87ac730204ac9aa9a719');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
