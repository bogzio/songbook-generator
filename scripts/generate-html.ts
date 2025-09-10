import fs from 'fs';
import path, { dirname } from 'path';
import { parseHTML } from 'linkedom';
import { fileURLToPath } from 'url';

import { Config } from '../config.ts';
import type { SongbookConfigType, TocItemType } from '../types.js';
import { getBookletOrder, getFormattedHTML, getSongbookConfig } from './utils.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const getTocItemHTML = (tocItem: TocItemType) => `
<div class="tocItem ${tocItem[4] ? 'isNewLetter' : ''}">
    <div class="tags">
        ${tocItem[2] ? '<div class="tag non-polish"></div>' : '<div class="tag"></div>'}
        ${tocItem[3] ? '<div class="tag new"></div>' : '<div class="tag"></div>'}
    </div>
    <div class="nameWrapper">
        <div class="name">${tocItem[0]}</div>
    </div>
    <div class="pageNumber">${tocItem[1]}</div>
</div>
`;

const emptyTemplateFile = fs.readFileSync(path.join(__dirname, '..', Config.templatesDirectory, Config.emptyTemplate));
const { document: emptyTemplateDocument } = parseHTML(emptyTemplateFile.toString());
const emptyPage = emptyTemplateDocument.querySelector('.page');

const getEmptyPageHTML = (isBookletOnly: boolean = false) => {
    emptyPage.classList.toggle('booklet-only', isBookletOnly);
    return emptyPage.outerHTML;
}

const getTitlePages = (songbookPath: string) => {
    const songbookConfig = getSongbookConfig(songbookPath);
    const titlePage = fs.readFileSync(path.join(songbookPath, songbookConfig.titlePageFile));

    if (!titlePage) {
        return [];
    }

    const { document: titlePageDocument } = parseHTML(titlePage.toString());
    const pageElement = titlePageDocument.querySelector('.page');

    return [
        pageElement.outerHTML,
        getEmptyPageHTML(),
    ]
}

const getToc = (songsDirectory: string) => {
    const toc = [];

    fs.readdirSync(songsDirectory).forEach(fileName => {
        const file = fs.readFileSync(path.join(songsDirectory, fileName));
        const { document } = parseHTML(file.toString());

        const pageNumber = parseInt(fileName);

        document.querySelectorAll('.song').forEach(songElement => {
            const nameElements = songElement.querySelectorAll('.title, .author');
            const name = Array.from(nameElements).map((element: HTMLElement) => element.innerHTML).join(' – ');
            const nonPolish = !!songElement.querySelector('.non-polish');
            const isNew = !!songElement.querySelector('.new');
            toc.push([name, pageNumber, nonPolish, isNew]);
        });
    });

    toc.sort((a, b) => a[0].localeCompare(b[0]));

    const tocTemplateFile = fs.readFileSync(path.join(__dirname, '..', Config.templatesDirectory, Config.tocTemplate));
    const { document: tocTemplateDocument } = parseHTML(tocTemplateFile.toString());

    const pageElement = tocTemplateDocument.querySelector('.page');

    const groups = [[[...toc[0], true]]];
    let currentGroupSize = 1;

    for (let i = 1; i < toc.length; i++) {
        const isNewLetter = toc[i][0].charAt(0) !== toc[i-1][0].charAt(0);
        const itemSize = isNewLetter ? Config.tocItemNewLetterSizeFactor : 1;
        if (currentGroupSize + itemSize > Config.tocItemsCountPerPage) {
            currentGroupSize = 0;
            groups.push([]);
        }
        currentGroupSize += itemSize;
        groups.at(-1).push([...toc[i], isNewLetter]);
    }

    const pages = groups.map((group, index) => {
        pageElement.classList.remove('left', 'right');
        pageElement.classList.add(index %2 === 0 ? 'right' : 'left');
        return pageElement.outerHTML.replace('#content#', group.map(getTocItemHTML).join('\n'));
    })

    if (pages.length % 2 === 1) {
        pages.push(getEmptyPageHTML());
    }

    return pages;
}

const getSongs = (songsDirectory: string, songbookConfig: SongbookConfigType) => {
    const pages = [];

    fs.readdirSync(songsDirectory).forEach(fileName => {
        const file = fs.readFileSync(path.join(songsDirectory, fileName));
        const pageNumber = parseInt(fileName);
        const { document } = parseHTML(file.toString());
        const page = document.querySelector('.page');

        page.classList.add(pageNumber %2 === 0 ? 'left' : 'right');
        page.querySelector('footer').innerHTML = pageNumber.toString();
        page.querySelector('footer').dataset.extra = `${songbookConfig.footerExtra} ~ ${songbookConfig.version}`;

        pages.push(page.outerHTML);
    });

    return pages;
}

const getEndPages = (songbookPath: string) => {
    const songbookConfig = getSongbookConfig(songbookPath);
    const endPage = fs.readFileSync(path.join(songbookPath, songbookConfig.endPageFile));

    if (!endPage) {
        return [];
    }

    const { document: endPageDocument } = parseHTML(endPage.toString());
    const pageElement = endPageDocument.querySelector('.page');

    return [
        getEmptyPageHTML(),
        pageElement.outerHTML,
    ]
}

export const generateHtml = (songbookPath: string) => {

    const songsDirectory = path.join(path.normalize(songbookPath), Config.songsDirectory);
    const songbookConfig = getSongbookConfig(songbookPath);

    const htmlParts = [];

    htmlParts.push(...getTitlePages(songbookPath));
    htmlParts.push(...getToc(songsDirectory));
    htmlParts.push(...getSongs(songsDirectory, songbookConfig));

    const endPages = getEndPages(songbookPath);
    const missingPages = htmlParts.length % 2;
    const missingBookletPages = (htmlParts.length + endPages.length + missingPages) % 4;

    htmlParts.push(...Array(missingPages).fill(getEmptyPageHTML()));
    htmlParts.push(...Array(missingBookletPages).fill(getEmptyPageHTML(true)));
    htmlParts.push(...endPages);

    const indexTemplate = fs.readFileSync(path.join(__dirname, '..', Config.templatesDirectory, Config.indexTemplate));
    const indexContent = indexTemplate.toString().replace('#content#', htmlParts.join('\n'));

    if (!fs.existsSync(path.join(path.normalize(songbookPath), Config.outputDirectory))) {
        fs.mkdirSync(path.join(path.normalize(songbookPath), Config.outputDirectory));
    }

    const htmlOutputFile = `${Config.songbookPrefix}-${songbookConfig.version}.html`;
    fs.writeFileSync(path.join(path.normalize(songbookPath), Config.outputDirectory, htmlOutputFile), indexContent);

    const { document: indexDocument } = parseHTML(indexContent);

    indexDocument.querySelector('body').classList.add('booklet');

    const pages = indexDocument.querySelectorAll('.page');
    pages.forEach((page, index) => {
        page.setAttribute('style', `order: ${getBookletOrder(index, pages.length)}`);
    });

    const pagesCount = pages.length;
    const songsCount = indexDocument.querySelectorAll('.song').length;
    console.log(`${songsCount} piosenek / ${pagesCount} stron / ${pagesCount / 4} kartek w booklecie`);

    const htmlBookletOutputFile = `${Config.bookletPrefix}-${songbookConfig.version}.html`;
    fs.writeFileSync(path.join(path.normalize(songbookPath), Config.outputDirectory, htmlBookletOutputFile), getFormattedHTML(indexDocument));
}