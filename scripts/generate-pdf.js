const path = require('path');
const puppeteer = require('puppeteer');
const Config = require('../config.json');

const generateFile = async (inputFile, outputFile, options) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(inputFile);
    await page.pdf({
        path: outputFile,
        printBackground: true,
        ...options,
    });
    await browser.close();
}

const generatePdf = async (songbookPath) => {
    const outputDirectory = path.join(path.normalize(songbookPath), Config.outputDirectory);
    await Promise.all([
        generateFile(
            `file://${path.resolve(path.join(outputDirectory, Config.htmlOutputFile))}`,
            path.join(outputDirectory, Config.pdfOutputFile),
            {
                width: '148.5mm',
                height: '210mm',
            },
        ),
        generateFile(
            `file://${path.resolve(path.join(outputDirectory, Config.htmlBookletOutputFile))}`,
            path.join(outputDirectory, Config.pdfBookletOutputFile),
            {
                width: '297mm',
                height: '210mm',
            },
        ),
    ])
}

module.exports.generatePdf = generatePdf;

