#!/usr/bin/env node

import { Command, Argument } from 'commander';
import readlineSync from 'readline-sync';

import { addPage } from './scripts/add-page.ts';
import { formatSongs } from './scripts/format-songs.ts';
import { generateHtml } from './scripts/generate-html.ts';
import { generatePdf } from './scripts/generate-pdf.ts';
import { optimizeOrder } from './scripts/optimize-order.ts';
import { lockSongs } from './scripts/lock-songs.ts';


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
    .addArgument(new Argument('[what]', 'what to generate').choices(['pdf', 'html']))
    .action(async (what) => {

        if (what === 'html' || !what) {
            console.log('generowanie html...')
            generateHtml(process.cwd());
            console.log('wygenerowano html!')
        }

        if (what === 'pdf' || !what) {
            console.log('generowanie pdf...')
            await generatePdf(process.cwd(), !what);
            console.log('wygenerowano pdf!');
        }

        console.log('zakończono generację.')
    })

program
    .command('optimize-order')
    .summary('rozkłada piosenki optymalnie')
    .description('rozkłada piosenki na stronach tak aby zmieściło się ich jak najwięcej na jak najmniejszej liczbie stron')
    .action(async () => {
        const confirmed = readlineSync.keyInYN('Ta operacja nadpisze cały katalog songs, czy jesteś pewien?');

        if (confirmed) {
            console.log('optymalizacja kolejności...')
            await optimizeOrder(process.cwd());
            console.log('zakończono optymalizację kolejności.')
        } else {
            console.log('Anulowano.');
        }

    })

program
    .command('lock-songs')
    .summary('blokuje pozycję piosenki na danej stronie')
    .description('zachowuje aktualną kolejność piosenek i zabezpiecza je przed użyciem optimize-order')
    .action(() => {
        console.log('blokowanie piosenek...')
        lockSongs(process.cwd());
        console.log('zablokowano!')
    })

program.parse();