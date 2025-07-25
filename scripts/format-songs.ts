import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

import { Config } from '../config.ts';
import { toTitleCase, getFormattedHTML } from './utils.ts';


export const formatSongs = (songbookPath: string) => {

    fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory)).forEach(fileName => {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        const file = fs.readFileSync(filePath);
        const dom = new JSDOM(file.toString());

        // usuwanie spacji między akordami
        dom.window.document.querySelectorAll('dt').forEach(dtElement => {
            dtElement.innerHTML = dtElement.innerHTML
                .replace(/\s+/g, ' ')
                .replaceAll('( ', '(')
                .replaceAll(' / ', '/');
        });

        // dostosowanie tabów
        dom.window.document.querySelectorAll('.content').forEach(song => {
            const maxTabs = Math.ceil(Math.max(...Array.from(song.querySelectorAll('dt')).map((dt: HTMLElement) => dt.outerHTML.length)) / 4);
            song.innerHTML = song.innerHTML
                .split('\n')
                .map(row => {
                    const parts = row.split(/\s*(?=<dd)|(?=<dt>)/);
                    if (parts.length === 3) {
                        const dtTabs = Math.floor(parts[1].length / 4);
                        const tabs = Array(maxTabs - dtTabs + 1).fill('\t').join('');
                        return parts[0] + parts[1] + tabs + parts[2];
                    } else {
                        return row;
                    }
                })
                .join('\n')
        });

        dom.window.document.querySelectorAll('.song').forEach(songElement => {
            // zmiana wielkości liter w tytule i autorze
            const titleElement = songElement.querySelector('.title');
            titleElement.innerHTML = toTitleCase(titleElement.innerHTML);
            const authorElement = songElement.querySelector('.author');
            if (authorElement) {
                authorElement.innerHTML = authorElement.innerHTML.toUpperCase();
            }
        });

        fs.writeFileSync(filePath, getFormattedHTML(dom));
    });
}