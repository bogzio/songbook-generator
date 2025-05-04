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

/**
 * Dzieli tablicę na grupy o zadanej liczbie elementów
 * @param {any[]} array
 * @param {number} itemsInFirstGroup
 * @param {number} itemsInNextGroups
 * @returns any[][]
 */
module.exports.groupArray = (array, itemsInFirstGroup, itemsInNextGroups) => {
    const groups = [ array.slice(0, itemsInFirstGroup) ];
    const otherItemsCount = array.length - itemsInFirstGroup;
    const otherPagesCount = Math.ceil(otherItemsCount / itemsInNextGroups);
    for (let i = 0; i < otherPagesCount; i++) {
        const start = itemsInFirstGroup + i * itemsInNextGroups;
        groups.push(array.slice(start, start + itemsInNextGroups));
    }
    return groups;
}

module.exports.getBookletOrder = (originalIndex, pagesCount) => {
    const firstHalf = originalIndex < pagesCount / 2;
    const distanceFromEnd = firstHalf ? originalIndex : pagesCount - originalIndex;
    const offset = firstHalf ? 1 : -1;
    return distanceFromEnd + Math.floor(distanceFromEnd / 2) * 2 + offset;
};

module.exports.getSongbookConfig = (songbookPath) =>
    JSON.parse(fs.readFileSync(path.join(path.normalize(songbookPath), Config.songbookConfigFile)));