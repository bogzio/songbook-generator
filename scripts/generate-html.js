const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Config = require('../config.json');
const { groupArray, getCommandLineArguments} = require("./utils");

const getTocItemHTML = (tocItem) => `
<div class="tocItem">
    <div class="name">${tocItem[0]}</div>
    <div class="separator"></div>
    <div class="pageNumber">${tocItem[1]}</div>
</div>
`;

const getToc = (songsDirectory) => {
    const toc = [];

    fs.readdirSync(songsDirectory).forEach(fileName => {
        const file = fs.readFileSync(path.join(songsDirectory, fileName));
        const dom = new JSDOM(file.toString());

        const pageNumber = parseInt(fileName);

        dom.window.document.querySelectorAll('.song').forEach(songElement => {
            const nameElements = songElement.querySelectorAll('.title, .author');
            const name = Array.from(nameElements).map(element => element.innerHTML).join(' – ');
            toc.push([name, pageNumber]);
        });
    });

    toc.sort((a, b) => a[0].localeCompare(b[0]));

    const tocTemplateFile = fs.readFileSync(path.join(Config.templatesDirectory, Config.tocTemplate));
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

    tocTemplateDom.window.document.querySelector('.toc').innerHTML = pages.join('\n');

    return tocTemplateDom.window.document.querySelector('.toc').outerHTML;
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

const generate = () => {

    const [songsRepository] = getCommandLineArguments();
    if (!songsRepository) {
        console.log('Usage: node .\\format-songs.js ..\\my-songs-repo');
        return;
    }

    const songsDirectory = path.join(path.normalize(songsRepository), Config.songsDirectory);
    const songbookConfig = JSON.parse(fs.readFileSync(path.join(path.normalize(songsRepository), Config.songbookConfigFile)));

    const htmlParts = [];

    htmlParts.push(getToc(songsDirectory));
    htmlParts.push('<div class="pageBreak"></div>');
    htmlParts.push(...getSongs(songsDirectory, songbookConfig));

    const indexTemplate = fs.readFileSync(path.join(Config.templatesDirectory, Config.indexTemplate));
    const indexContent = indexTemplate.toString().replace('#content#', htmlParts.join('\n'));

    if (!fs.existsSync(path.join(path.normalize(songsRepository), Config.outputDirectory))) {
        fs.mkdirSync(path.join(path.normalize(songsRepository), Config.outputDirectory));
    }

    fs.writeFileSync(path.join(path.normalize(songsRepository), Config.outputDirectory, Config.htmlOutputFile), indexContent);
}

generate();