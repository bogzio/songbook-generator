const path = require('path');
const puppeteer = require('puppeteer');
const Config = require('../config.json');


const generatePdf = async (songbookPath) => {

    const outputDirectory = path.join(path.normalize(songbookPath), Config.outputDirectory);

    await (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`file://${path.resolve(path.join(outputDirectory, Config.htmlOutputFile))}`);

        await page.evaluateHandle('document.fonts.ready');

        await page.pdf({
            path: path.join(outputDirectory, Config.pdfOutputFile),
            printBackground: true,
            width: '148.5mm',
            height: '210mm',
            waitForFonts: true,
        });

        await browser.close();
    })();

    await (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`file://${path.resolve(path.join(outputDirectory, Config.htmlBookletOutputFile))}`);

        await page.evaluateHandle('document.fonts.ready');

        await page.pdf({
            path: path.join(outputDirectory, Config.pdfBookletOutputFile),
            printBackground: true,
            width: '297mm',
            height: '210mm',
            waitForFonts: true,
        });

        await browser.close();
    })();
}

module.exports.generatePdf = generatePdf;

