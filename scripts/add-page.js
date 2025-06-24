const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Config = require('../config.json');
const { getFormattedHTML} = require('./utils')


const addPageWithSongs = (songbookPath, getSongs) => {
    const lastPage = fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory))
        .map(fileName => fileName.replace('.html', ''))
        .toSorted()
        .at(-1);

    const fileName = String(parseInt(lastPage || 0, 10) + 1).padStart(3, '0') + '.html';

    const songTemplate = fs.readFileSync(path.join(__dirname, '..', Config.templatesDirectory, Config.songTemplate));
    const songDom = new JSDOM(songTemplate.toString())

    const pageNode = songDom.window.document.querySelector('.page');
    const songNode = songDom.window.document.querySelector('.song');
    const footerNode = songDom.window.document.querySelector('footer');

    pageNode.innerHTML = '\n\n' + getSongs(songNode)
        .join('\n\n')
        .concat('\n\n')
        .concat(`\t\t${footerNode.outerHTML}\n\n`);

    fs.writeFileSync(path.join(path.normalize(songbookPath), Config.songsDirectory, fileName), getFormattedHTML(songDom));
}

module.exports.addPageWithSongs = addPageWithSongs;

const addPage = (songbookPath, columns) => {
    addPageWithSongs(
        songbookPath,
        songNode => columns.map(columnsCount => `\t\t${songNode.outerHTML.replace('columns-#', `columns-${columnsCount}`)}`),
    );
}

module.exports.addPage = addPage;
