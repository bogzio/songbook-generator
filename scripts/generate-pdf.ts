import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

import { Config } from '../config.ts';
import { getSongbookConfig } from './utils.ts';


/**
 * Generates single pdf file
 * @param {string} inputFile
 * @param {string} outputFile
 * @param options - puppeteer pdf function options
 * @returns {Promise<void>}
 */
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

/**
 * Generates pdf files from html versions
 * @param {string} songbookPath - path to the songbook root directory
 * @param {boolean} deleteHtmlFiles - delete html files after pdf generation
 * @returns {Promise<void>}
 */
export const generatePdf = async (songbookPath, deleteHtmlFiles) => {
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

    if (deleteHtmlFiles) {
        fs.unlinkSync(path.join(outputDirectory, htmlOutputFile));
        fs.unlinkSync(path.join(outputDirectory, htmlBookletOutputFile));
    }
}

