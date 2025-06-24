const path = require('path');
const puppeteer = require('puppeteer');
const Config = require('../config.json');
const fs = require("fs");
const { addPageWithSongs} = require("./add-page");


const getPageHeight = async (pagePath, page) => {
    await page.goto(pagePath);
    return await page.$eval('.page', el => {
        const style = window.getComputedStyle(el);
        const footerHeight = el.querySelector('footer').clientHeight;
        return el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - footerHeight;
    })
}

const getSongsMargin = async (songbookPath, fileNames, page) => {
    for (const fileName of fileNames) {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        await page.goto(filePath);
        try {
            return await page.$eval('.song + .song', el => {
                const style = window.getComputedStyle(el);
                return parseFloat(style.marginTop);
            })
        } catch (e) {}
    }
    return 0;
}

const getSongsHeights = async (songbookPath, fileNames, page) => {
    const heights = [];
    for (const fileName of fileNames) {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        await page.goto(filePath);
        heights.push(...await page.$$eval('.song', elements => elements.map(element => ({
            height: element.clientHeight,
            html: element.outerHTML,
        }))));
    }
    return heights;
}

const orderSongs = (songs, songsMargin, pageHeight) => {
    const sorted = songs.toSorted((a, b) => b.height - a.height);
    const groups = [];

    for (const song of sorted) {
        let pushed = false;
        for (const group of groups) {
            const currentHeight = group.reduce((sum, item) => sum + item.height + songsMargin, 0);
            if (currentHeight + song.height <= pageHeight) {
                group.push(song);
                pushed = true;
                break;
            }
        }
        if (!pushed) {
            groups.push([song]);
        }
    }

    return groups;
}

const removePages = (songbookPath, fileNames) => {
    for (const fileName of fileNames) {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        fs.unlinkSync(filePath);
    }
}

const optimizeOrder = async (songbookPath) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const fileNames = fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory));

    const pageHeight = await getPageHeight(path.join(path.normalize(songbookPath), Config.songsDirectory, fileNames[0]), page);
    const songsMargin = await getSongsMargin(songbookPath, fileNames, page);
    const songsHeights = await getSongsHeights(songbookPath, fileNames, page);

    const groups = orderSongs(songsHeights, songsMargin, pageHeight);

    removePages(songbookPath, fileNames);

    for (const group of groups) {
        addPageWithSongs(songbookPath, () => group.map(song => `\t\t${song.html}`));
    }

    await browser.close();
}

module.exports.optimizeOrder = optimizeOrder;

