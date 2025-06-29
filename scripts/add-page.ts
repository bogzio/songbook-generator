import fs from 'fs';
import path, { dirname } from 'path';
import { JSDOM } from 'jsdom';
import { fileURLToPath } from 'url';

import { Config } from '../config.ts';
import { getFormattedHTML } from './utils.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addPageWithSongs = (songbookPath, getSongs) => {
    const lastPage = fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory))
        .map(fileName => fileName.replace('.html', ''))
        .toSorted()
        .at(-1);

    const fileName = String(parseInt(lastPage || '0', 10) + 1).padStart(3, '0') + '.html';

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

export const addPage = (songbookPath, columns) => {
    addPageWithSongs(
        songbookPath,
        songNode => columns.map(columnsCount => `\t\t${songNode.outerHTML.replace('columns-#', `columns-${columnsCount}`)}`),
    );
}
