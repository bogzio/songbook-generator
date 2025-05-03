const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Config = require('../config.json');
const { getFormattedHTML, getCommandLineArguments} = require('./utils')


const [songbookPath, ...columns] = getCommandLineArguments();
if (!songbookPath || !columns.length) {
    console.log('Usage: node .\\add-page.js ..\\my-songs-repo 2 1');
    console.log(`will create a new page in ..\\my-songs-repo\\${Config.songsDirectory} with 2 songs, first in 2-column layout and the second in 1-column layout`);
    return;
}

const lastPage = fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory))
    .map(fileName => fileName.replace('.html', ''))
    .toSorted()
    .at(-1);

const fileName = String(parseInt(lastPage || 0, 10) + 1).padStart(3, '0') + '.html';

const songTemplate = fs.readFileSync(path.join(Config.templatesDirectory, Config.songTemplate));
const songDom = new JSDOM(songTemplate.toString())

const pageNode = songDom.window.document.querySelector('.page');
const songNode = songDom.window.document.querySelector('.song');
const footerNode = songDom.window.document.querySelector('footer');

const content = '\n\n' + columns
    .map(columnsCount => `\t\t${songNode.outerHTML.replace('columns-#', `columns-${columnsCount}`)}`)
    .join('\n\n')
    .concat('\n\n')
    .concat(`\t\t${footerNode.outerHTML}\n\n`);

pageNode.innerHTML = content;

fs.writeFileSync(path.join(path.normalize(songbookPath), Config.songsDirectory, fileName), getFormattedHTML(songDom));
