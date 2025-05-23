const path = require('path');
const puppeteer = require('puppeteer');
const Config = require('../config.json');
const { getSongbookConfig } = require("./utils");

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
    const songbookConfig = getSongbookConfig(songbookPath);
    const htmlOutputFile = `${Config.songbookPrefix}-${songbookConfig.version}.html`;
    const htmlBookletOutputFile = `${Config.bookletPrefix}-${songbookConfig.version}.html`;
    const pdfOutputFile = `${Config.songbookPrefix}-${songbookConfig.version}.pdf`;
    const pdfBookletOutputFile = `${Config.bookletPrefix}-${songbookConfig.version}.pdf`;

    await Promise.all([
        generateFile(
            `file://${path.resolve(path.join(outputDirectory, htmlOutputFile))}`,
            path.join(outputDirectory, pdfOutputFile),
            {
                width: '148.5mm',
                height: '210mm',
            },
        ),
        generateFile(
            `file://${path.resolve(path.join(outputDirectory, htmlBookletOutputFile))}`,
            path.join(outputDirectory, pdfBookletOutputFile),
            {
                width: '297mm',
                height: '210mm',
            },
        ),
    ])
}

module.exports.generatePdf = generatePdf;

