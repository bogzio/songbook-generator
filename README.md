# Instalacja
Najpierw zainstaluj najnowszą wersję Node.js: https://nodejs.org/en/download. Następnie otwórz konsolę w głównym katalogu `songbook-generator` i wykonaj polecenie `npm i`.

# Struktura plików
Katalogi ze śpiewnikami powinny być obok repozytorium `songbook-generator` ze względu na ścieżki do styli ustawione na sztywno:
```
Root
├── songbook-generator
├── moj-maly-spiewniczek
│   └── songs
└── inny-spiewnik
    └── songs
```

# Skrypty
Przykładowe wykonania zakładają że znajdujemy się w głównym katalogu `songbook-generator` w środowisku Windows:

## dodawanie nowej strony
dodaj nową stronę z dwoma piosenkami, pierwsza 2 kolumnowa, druga 1 kolumnowa:
```
node .\scripts\add-page.js ..\moj-maly-spiewniczek 2 1
```

## formatowanie piosenek
formatuje pliki html z piosenkami, porządkuje taby, dodaje spacje między akordami itp
```
node .\scripts\format-songs.js ..\moj-maly-spiewniczek
```

## generowanie plików wynikowych
generuj śpiewnik html:
```
node .\scripts\generate-html.js ..\moj-maly-spiewniczek
```

generuj śpiewnik pdf (wcześniej należy wygenerować html, oraz nie należy mieć otwartego pliku generated.pdf w czytniku pdf):
```
node .\scripts\generate-pdf.js ..\moj-maly-spiewniczek
```

można wykonać oba polecenia jedno po drugim za pomocą tej komendy:
```
node .\scripts\generate-html.js ..\moj-maly-spiewniczek | node .\scripts\generate-pdf.js ..\moj-maly-spiewniczek
```

powinny zostać wygenerowane takie pliki:
```
moj-maly-spiewniczek
└── generated
    ├── output.html
    ├── output.pdf
    ├── booklet.html
    └── booklet.pdf
```
`output` to pliki do zwykłego druku w formacie A5, `booklet` to pliki które po wydrukowaniu w formacie A4, przecinamy w połowie i składamy na pół w tej kolejności w której są. Ułatwia to druk na zwykłych kartkach A4.

# Struktura piosenki i style

## Przykładowa struktura:
```
<div class="page">
    <div class="song">
        <header>
            <span class="title">Wlazł Kotek</span>
            <span class="author">PANI PRZEDSZKOLANKA</span>
            <span class="tags">
                <span class="tag capo">5</span>
                <span class="tag non-polish"></span>
            </span>
        </header>
        <div class="content-wrapper columns-2">
            <dl class="content b1 smaller-breaks">
                <dt>a B</dt>		<dd class="s1">Wlazł kotek na płotek</dd>
                <dt>c D</dt>		<dd class="s2">i mruga</dd>
                <dt>e F</dt>		<dd class="b1">ładna to piosenka</dd>
                <dt>g H</dt>		<dd class="b2">Niedługa</dd>
                <br>
                ...
```
## Klasy:
* klasy do zmieniania rozmiarów, kiedy nie chcemy aby konkretne wiersze były łamane do kolejnej linijki: (`b` = bigger, `s` = smaller): `b1`, `b2`, `s1`, `s2`, `s3`, `s4` - czym wyższy numer tym bardziej tekst jest powiększony / pomniejszony.
* klasa do zmniejszania odstępów `<br>` kiedy piosenka nie mieści się na wysokość a nie ma już łamanych wierszy: `smaller-breaks`
* ustawianie na ile kolumn zostanie podzielona piosenka (domyślnie jedna): `columns-2`, `columns-3`
* tag `capo` dodaje informację o tym na jakim progu umieścić kapodaster a `non-polish` dodaje oznaczenie o tym, że piosenka nie jest w języku polskim (pojawi się ono tez w spisie treści, przydatne do szukania czegoś do zaśpiewania ze znajomymi nie znającymi polskiego)