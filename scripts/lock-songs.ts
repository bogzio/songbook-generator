import fs from 'fs';
import path from 'path';
import { parseHTML } from 'linkedom';

import { Config } from '../config.ts';
import { getFormattedHTML } from './utils.ts';


export const lockSongs = (songbookPath: string) => {

    fs.readdirSync(path.join(path.normalize(songbookPath), Config.songsDirectory)).forEach(fileName => {
        const filePath = path.join(path.normalize(songbookPath), Config.songsDirectory, fileName);
        const file = fs.readFileSync(filePath);
        const { document } = parseHTML(file.toString());

        document.querySelectorAll('.song').forEach((songElement, index) => {
            const header = songElement.querySelector('header');
            const indentation = header.innerHTML.split('\n').filter(Boolean)[0].split('<')[0];

            if (!header.querySelector('.tags')) {
                header.insertAdjacentHTML('beforeend', `\t<span class="tags">\n${indentation}</span>\n${indentation.slice(0, -1)}`);
            }

            const tags = header.querySelector('.tags');

            if (!tags.querySelector('.tag.locked')) {
                tags.insertAdjacentHTML('beforeend', `\t<span class="tag locked"></span>\n${indentation}`);
            }

            const locked = tags.querySelector('.locked');
            locked.innerHTML = `${parseInt(fileName, 10)}.${index + 1}`;
        });

        fs.writeFileSync(filePath, getFormattedHTML(document));
    });
}