import fs from 'fs';
import path from 'path';
import type { JSDOM } from 'jsdom';

import { Config } from '../config.ts';
import type { SongbookConfigType } from '../types.js';


export const toTitleCase = (string: string): string =>
    string
        .toLowerCase()
        .split(' ')
        .map(word => word.replace(/^./, str => str.toLocaleUpperCase()))
        .join(' ');

export const getFormattedHTML = (dom: JSDOM): string =>
    dom.window.document.documentElement.outerHTML
        .replace('<html', '<!DOCTYPE html>\n<html')
        .replace('<html lang="pl"><head>', '<html lang="pl">\n<head>')
        .replace(/<\/div>\s+<\/body><\/html>/, '</div>\n</body>\n</html>');

export const getBookletOrder = (originalIndex: number, pagesCount: number): number => {
    const firstHalf = originalIndex < pagesCount / 2;
    const distanceFromEnd = firstHalf ? originalIndex : pagesCount - originalIndex;
    const offset = firstHalf ? 1 : -1;
    return distanceFromEnd + Math.floor(distanceFromEnd / 2) * 2 + offset;
};

export const getSongbookConfig = (songbookPath: string): SongbookConfigType =>
    JSON.parse(fs.readFileSync(path.join(path.normalize(songbookPath), Config.songbookConfigFile)).toString());