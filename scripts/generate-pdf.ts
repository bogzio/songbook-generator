import path from 'path';
import fs from 'fs';
import puppeteer, { type PDFOptions } from 'puppeteer';

import { Config } from '../config.ts';
import { getSongbookConfig } from './utils.ts';


/** Generates single pdf file */
const generateFile = async (inputFile: string, outputFile: string, options: PDFOptions) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 650, height: 900, deviceScaleFactor: 2 });
    await page.goto(inputFile);
    await page.pdf({
        path: outputFile,
        printBackground: true,
        ...options,
    });
    await browser.close();
}

/** Generates pdf files from html versions */
export const generatePdf = async (songbookPath: string, deleteHtmlFilesAfterGeneration: boolean) => {
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

    if (deleteHtmlFilesAfterGeneration) {
        fs.unlinkSync(path.join(outputDirectory, htmlOutputFile));
        fs.unlinkSync(path.join(outputDirectory, htmlBookletOutputFile));
    }
}

