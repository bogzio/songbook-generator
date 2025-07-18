export type ConfigType = {
    /** Songs directory name (in the songbook folder) */
    songsDirectory: string,


    /** Output directory for generated songbooks (in the songbook folder) */
    outputDirectory: string,

    /** Standard generated PDFs will be prefixed with this name */
    songbookPrefix: string,

    /** Booklet generated PDFs will be prefixed with this name */
    bookletPrefix: string,


    /** Templates directory */
    templatesDirectory: string,

    /** Table of contents template file */
    tocTemplate: string,

    /** Index file template - this will be the base file for PDF generation */
    indexTemplate: string,

    /** Song file template */
    songTemplate: string,

    /** Empty page template */
    emptyTemplate: string,


    /** Number of lines in table of contents */
    tocItemsCountPerPage: number,

    /** How much bigger is line with additional margin on the top */
    tocItemNewLetterSizeFactor: number,


    /** Name of the songbook config file (in the songbook folder) */
    songbookConfigFile: string,
}

export type SongbookConfigType = {
    /** Version of the songbook - printed in the footer */
    version: string,

    /** Extra string to put in the footer (e.g. name of the songbook) */
    footerExtra: string,

    /** name of the title page file */
    titlePageFile: string,

    /** name of the end page file */
    endPageFile: string,
}

export type TocItemType = [
    /** name and author of the song */
    name: string,

    /** page number */
    pageNumber: number,

    /** mark with the "foreign language" tag */
    nonPolish: boolean,

    /** mark with the "new" tag */
    isNew: boolean,

    /** render as the firs item with new letter */
    isNewLetter: boolean,
];

export type SongWithMetadata = {
    height: number,
    html: string,
    popularity: number,
}