const fs = require("fs");
const path = require("path");
const Config = require("../config.json");

module.exports.toTitleCase = (string) => string
    .toLowerCase()
    .split(' ')
    .map(word => word.replace(/^./, str => str.toLocaleUpperCase()))
    .join(' ');

module.exports.getFormattedHTML = (dom) => dom.window.document.documentElement.outerHTML
    .replace('<html', '<!DOCTYPE html>\n<html')
    .replace('<html lang="pl"><head>', '<html lang="pl">\n<head>')
    .replace(/<\/div>\s+<\/body><\/html>/, '</div>\n</body>\n</html>');

module.exports.getBookletOrder = (originalIndex, pagesCount) => {
    const firstHalf = originalIndex < pagesCount / 2;
    const distanceFromEnd = firstHalf ? originalIndex : pagesCount - originalIndex;
    const offset = firstHalf ? 1 : -1;
    return distanceFromEnd + Math.floor(distanceFromEnd / 2) * 2 + offset;
};

module.exports.getSongbookConfig = (songbookPath) =>
    JSON.parse(fs.readFileSync(path.join(path.normalize(songbookPath), Config.songbookConfigFile)));