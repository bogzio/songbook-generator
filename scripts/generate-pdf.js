const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const Config = require('../config.json');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    await page.goto(`file://${path.resolve(path.join(Config.outputDirectory, Config.htmlOutputFile))}`);

    await page.pdf({
        path: path.join(Config.outputDirectory, Config.pdfOutputFile),
        printBackground: true,
        width: '148mm',
        height: '210mm',
    });

    await browser.close();
})();
