import path, { dirname } from 'path';
import fs from 'fs';
import puppeteer, { Page } from 'puppeteer';

import { Config } from '../config.ts';
import { addPageWithSongs} from './add-page.ts';
import type { SongWithMetadata } from '../types.js';


const getPageHeight = async (pagePath: string, page: Page): Promise<number> => {
    await page.goto(pagePath);
    return await page.$eval('.page', el => {
        const style = window.getComputedStyle(el);
        const footerHeight = el.querySelector('footer').clientHeight;
        return el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - footerHeight;
    })
}

const getSongsMargin = async (songbookPath: string, fileNames: string[], page: Page): Promise<number> => {
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

const getSongsMetadata = async (songbookPath: string, fileNames: string[], page: Page): Promise<SongWithMetadata[]> => {
    const heights = [];
    for (const fileName of fileNames) {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        await page.goto(filePath);
        await page.waitForFunction('document.fonts.ready');
        heights.push(...await page.$$eval('.song', elements => elements.map(element => ({
            height: element.clientHeight,
            html: element.outerHTML,
            title: element.querySelector('.title')?.innerHTML,
            popularity: parseInt(element.querySelector('.tag.popularity')?.innerHTML ?? '0'),
            lockedPosition: element.querySelector('.tag.locked')?.innerHTML,
        }))));
    }
    return heights;
}

const getGroupRating = (group: SongWithMetadata[]) =>
    group.reduce((sum, { popularity }) => sum + popularity, 0)

const orderSongs = (songs: SongWithMetadata[], songsMargin: number, pageHeight: number): SongWithMetadata[][] => {
    const lockedSongs = songs.filter(song => song.lockedPosition);
    const otherSongs = songs.filter(song => !song.lockedPosition);

    const initialGroupsSize = Math.max(...lockedSongs.map(song => parseInt(song.lockedPosition, 10)), 0);

    const groups: SongWithMetadata[][] = Array.from({ length: initialGroupsSize }, () => []);

    for (const lockedSong of lockedSongs) {
        const index = parseInt(lockedSong.lockedPosition, 10) - 1;
        groups[index].push(lockedSong);
        groups[index].sort((a, b) => a.lockedPosition.localeCompare(b.lockedPosition));
    }

    const sorted = otherSongs
        .toSorted((a, b) => a.title.localeCompare(b.title))
        .toSorted((a, b) => b.height - a.height);

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

    return groups.toSorted((a, b) => {
        if ([...a, ...b].some(song => song.lockedPosition)) {
            return 0;
        }
        return getGroupRating(b) - getGroupRating(a);
    });
}

const removePages = (songbookPath: string, fileNames: string[]) => {
    for (const fileName of fileNames) {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        fs.unlinkSync(filePath);
    }
}

export const optimizeOrder = async (songbookPath: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 650, height: 900 });

    const fileNames = fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory));

    const pageHeight = await getPageHeight(path.join(path.normalize(songbookPath), Config.songsDirectory, fileNames[0]), page);
    const songsMargin = await getSongsMargin(songbookPath, fileNames, page);
    const songsHeights = await getSongsMetadata(songbookPath, fileNames, page);

    const groups = orderSongs(songsHeights, songsMargin, pageHeight);

    removePages(songbookPath, fileNames);

    for (const group of groups) {
        addPageWithSongs(songbookPath, () => group.map(song => `\t\t${song.html}`));
    }

    await browser.close();
}

