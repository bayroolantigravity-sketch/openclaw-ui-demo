const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });

    await page.goto('http://localhost:3000/quiz', { waitUntil: 'load' });

    // Wait for the options to render
    await page.waitForTimeout(2000);

    // Click Unisex
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const unisex = buttons.find(b => b.textContent.includes('Unisex'));
        if (unisex) unisex.click();
    });

    // Wait for React to throw the error and logs to be captured
    await page.waitForTimeout(2000);

    await browser.close();
})();
