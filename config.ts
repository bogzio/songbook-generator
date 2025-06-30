import type { ConfigType } from './types.js';


export const Config: ConfigType = {
    songsDirectory: "songs",

    outputDirectory: "generated",
    songbookPrefix: "spiewnik",
    bookletPrefix: "spiewnik-booklet",

    templatesDirectory: "templates",
    tocTemplate: "toc.template.html",
    indexTemplate: "index.template.html",
    songTemplate: "song.template.html",
    emptyTemplate: "empty.template.html",

    tocItemsCountPerPage: 44,
    tocItemNewLetterSizeFactor: 1.666,

    songbookConfigFile: "songbook-config.json"
}