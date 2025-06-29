import fs from 'fs';
import path from 'path';

import { Config } from '../config.ts';


export const toTitleCase = (string) => string
    .toLowerCase()
    .split(' ')
    .map(word => word.replace(/^./, str => str.toLocaleUpperCase()))
    .join(' ');

export const getFormattedHTML = (dom) => dom.window.document.documentElement.outerHTML
    .replace('<html', '<!DOCTYPE html>\n<html')
    .replace('<html lang="pl"><head>', '<html lang="pl">\n<head>')
    .replace(/<\/div>\s+<\/body><\/html>/, '</div>\n</body>\n</html>');

export const getBookletOrder = (originalIndex, pagesCount) => {
    const firstHalf = originalIndex < pagesCount / 2;
    const distanceFromEnd = firstHalf ? originalIndex : pagesCount - originalIndex;
    const offset = firstHalf ? 1 : -1;
    return distanceFromEnd + Math.floor(distanceFromEnd / 2) * 2 + offset;
};

export const getSongbookConfig = (songbookPath) =>
    JSON.parse(fs.readFileSync(path.join(path.normalize(songbookPath), Config.songbookConfigFile)).toString());