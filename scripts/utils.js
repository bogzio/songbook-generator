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

module.exports.getCommandLineArguments = () => process.argv.slice(2);