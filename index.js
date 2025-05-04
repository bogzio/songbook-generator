#!/usr/bin/env node

const { Command, Argument } = require('commander');
const { addPage } = require("./scripts/add-page");
const { formatSongs } = require("./scripts/format-songs");
const {generateHtml} = require("./scripts/generate-html");
const {generatePdf} = require("./scripts/generate-pdf");

const program = new Command();

program
    .command('add-page')
    .summary('dodaje nową stronę z piosenkami w wybranych layoutach')
    .description('dodaje nową stronę wraz z piosenkami w wybranych layoutach, np add-page 1 2 doda stronę z dwoma piosenkami odpowiednio w 1- i 2- kolumnowym layoucie')
    .argument('<columns...>', 'liczba kolumn dla każdej z piosenek, możliwe opcje 1, 2 lub 3')
    .action((columns) => addPage(process.cwd(), columns))

program
    .command('format-songs')
    .summary('formatuje piosenki')
    .description('formatuje pliku źródłowe piosenek, dodaje brakujące taby w tekście, spacje między akordami itp.')
    .action(() => {
        console.log('formatowanie piosenek...')
        formatSongs(process.cwd());
        console.log('sformatowano!')
    })

program
    .command('generate')
    .summary('generuje śpiewnik')
    .addArgument(new Argument('[what]', 'what to generate').choices(['pdf', 'html', 'all']).default('all'))
    .action(async (what) => {

        if (what === 'html' || what === 'all') {
            console.log('generowanie html...')
            generateHtml(process.cwd());
            console.log('wygenerowano html!')
        }

        if (what === 'pdf' || what === 'all') {
            console.log('generowanie pdf...')
            await generatePdf(process.cwd());
            console.log('wygenerowano pdf!');
        }

        console.log('zakończono generację.')
    })

program.parse();