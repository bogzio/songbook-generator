const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Config = require('../config.json');
const { groupArray, getBookletOrder, getFormattedHTML, getSongbookConfig } = require("./utils");


const getTocItemHTML = (tocItem) => `
<div class="tocItem">
    <div class="name">${tocItem[0]}</div>
    <div class="tags">
        ${tocItem[2] ? '<div class="tag non-polish"></div>' : ''}
    </div>
    <div class="separator"></div>
    <div class="pageNumber">${tocItem[1]}</div>
</div>
`;

const emptyTemplateFile = fs.readFileSync(path.join(__dirname, '..', Config.templatesDirectory, Config.emptyTemplate));
const emptyTemplateDom = new JSDOM(emptyTemplateFile.toString());
const emptyPage = emptyTemplateDom.window.document.querySelector('.page');

const getEmptyPageHTML = (isBookletOnly = false) => {
    emptyPage.classList.toggle('booklet-only', isBookletOnly);
    return emptyPage.outerHTML;
}

const getTitlePages = (songbookPath) => {
    const songbookConfig = getSongbookConfig(songbookPath);
    const titlePage = fs.readFileSync(path.join(songbookPath, songbookConfig.titlePageFile));

    if (!titlePage) {
        return [];
    }

    const titlePageDOM = new JSDOM(titlePage.toString());
    const pageElement = titlePageDOM.window.document.querySelector('.page');

    return [
        pageElement.outerHTML,
        getEmptyPageHTML(),
    ]
}

const getToc = (songsDirectory) => {
    const toc = [];

    fs.readdirSync(songsDirectory).forEach(fileName => {
        const file = fs.readFileSync(path.join(songsDirectory, fileName));
        const dom = new JSDOM(file.toString());

        const pageNumber = parseInt(fileName);

        dom.window.document.querySelectorAll('.song').forEach(songElement => {
            const nameElements = songElement.querySelectorAll('.title, .author');
            const name = Array.from(nameElements).map(element => element.innerHTML).join(' – ');
            const nonPolish = !!songElement.querySelector('.non-polish');
            toc.push([name, pageNumber, nonPolish]);
        });
    });

    toc.sort((a, b) => a[0].localeCompare(b[0]));

    const tocTemplateFile = fs.readFileSync(path.join(__dirname, '..', Config.templatesDirectory, Config.tocTemplate));
    const tocTemplateDom = new JSDOM(tocTemplateFile.toString());

    const pageElement = tocTemplateDom.window.document.querySelector('.page');

    const groups = groupArray(toc, Config.tocItemsCountFirstPage, Config.tocItemsCountNextPages);

    const pages = groups.map((group, index) => {
        const header = index === 0 ? `<header>${Config.tocHeader}</header>` : undefined;
        const items = group.map(getTocItemHTML).join('\n');
        pageElement.classList.remove('left', 'right');
        pageElement.classList.add(index %2 === 0 ? 'right' : 'left');
        return pageElement.outerHTML.replace('#content#', [header, items].filter(Boolean).join('\n'));
    })

    if (pages.length % 2 === 1) {
        pages.push(getEmptyPageHTML());
    }

    return pages;
}

const getSongs = (songsDirectory, songbookConfig) => {
    const pages = [];

    fs.readdirSync(songsDirectory).forEach(fileName => {
        const file = fs.readFileSync(path.join(songsDirectory, fileName));
        const pageNumber = parseInt(fileName);
        const dom = new JSDOM(file.toString());
        const page = dom.window.document.querySelector('.page');

        page.classList.add(pageNumber %2 === 0 ? 'left' : 'right');
        page.querySelector('footer').innerHTML = pageNumber;
        page.querySelector('footer').dataset.extra = `${songbookConfig.footerExtra} ~ ${songbookConfig.version}`;

        pages.push(page.outerHTML);
    });

    return pages;
}

const getEndPages = (songbookPath) => {
    const songbookConfig = getSongbookConfig(songbookPath);
    const endPage = fs.readFileSync(path.join(songbookPath, songbookConfig.endPageFile));

    if (!endPage) {
        return [];
    }

    const endPageDOM = new JSDOM(endPage.toString());
    const pageElement = endPageDOM.window.document.querySelector('.page');

    return [
        getEmptyPageHTML(),
        pageElement.outerHTML,
    ]
}

const generateHtml = (songbookPath) => {

    const songsDirectory = path.join(path.normalize(songbookPath), Config.songsDirectory);
    const songbookConfig = getSongbookConfig(songbookPath);

    const htmlParts = [];

    htmlParts.push(...getTitlePages(songbookPath));
    htmlParts.push(...getToc(songsDirectory));
    htmlParts.push(...getSongs(songsDirectory, songbookConfig, htmlParts.length));

    const endPages = getEndPages(songbookPath);
    const missingPages = htmlParts.length % 2;
    const missingBookletPages = (htmlParts.length + endPages.length) % 4 - missingPages;

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

    const indexDom = new JSDOM(indexContent);

    indexDom.window.document.querySelector('body').classList.add('booklet');

    const pages = indexDom.window.document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        page.setAttribute('style', `order: ${getBookletOrder(index, pages.length)}`);
    });

    const pagesCount = pages.length;
    const songsCount = indexDom.window.document.querySelectorAll('.song').length;
    console.log(`${songsCount} piosenek / ${pagesCount} stron / ${pagesCount / 4} kartek w booklecie`);

    const htmlBookletOutputFile = `${Config.bookletPrefix}-${songbookConfig.version}.html`;
    fs.writeFileSync(path.join(path.normalize(songbookPath), Config.outputDirectory, htmlBookletOutputFile), getFormattedHTML(indexDom));
}

module.exports.generateHtml = generateHtml;