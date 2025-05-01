const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const Config = require('../config.json');
const {getCommandLineArguments} = require("./utils");

const [songsRepository] = getCommandLineArguments();
if (!songsRepository) {
    console.log('Usage: node .\\format-songs.js ..\\my-songs-repo');
    return;
}

const outputDirectory = path.join(path.normalize(songsRepository), Config.outputDirectory);

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    await page.goto(`file://${path.resolve(path.join(outputDirectory, Config.htmlOutputFile))}`);

    await page.pdf({
        path: path.join(outputDirectory, Config.pdfOutputFile),
        printBackground: true,
        width: '148.5mm',
        height: '210mm',
    });

    await browser.close();
})();
