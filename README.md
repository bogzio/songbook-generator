# Instalacja
Najpierw zainstaluj najnowszą wersję [Node.js](https://nodejs.org/en/download). Następnie otwórz konsolę w głównym katalogu `songbook-generator` i wykonaj polecenie `npm install` a następnie `npm link`. Od teraz możesz używać w konsoli globalnej komendy `songbook-generator`.

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
Skrypty należy wykonywać w głownym katalogu wybranego śpewnika. W razie problemów albo nieaktualnej dokumentacji można wywołać `songbook-generator help` albo `songbook-generator help nazwa-komendy`.

## dodawanie nowej strony
```
songbook-generator add-page 2 1
```
Doda nową stronę z odpowiednim numerem i dwoma piosenkami, pierwszą w layoucie 2-kolumnowym, drugą w 1-kolumnowym:


## formatowanie piosenek
```
songbook-generator format-songs
```
formatuje pliki html z piosenkami, porządkuje taby, dodaje spacje między akordami itp. Dobrze wykonywać na bieżąco, a na pewno przed commitem.

## generowanie gotowych śpiewników
```
songbook-generator generate
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
`output` to pliki do zwykłego druku w formacie A5, `booklet` to pliki które po wydrukowaniu w formacie A4 (orientacja pozioma, obracanie po krótszym boku), przecinamy w połowie i składamy na pół w tej kolejności w której są. Ułatwia to druk na zwykłych kartkach A4.

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
            <dl class="content b1">
                <dt>a B</dt>		<dd class="s1">Wlazł kotek na płotek</dd>
                <dt>c D</dt>		<dd class="s2">i mruga</dd>
                <dt>e F</dt>		<dd class="b1">ładna to piosenka</dd>
                <dt>g H</dt>		<dd class="b2">Niedługa</dd>
                <br>
                ...
```
## Klasy:
* klasy do zmieniania rozmiarów, kiedy nie chcemy aby konkretne wiersze były łamane do kolejnej linijki: (`b` = bigger, `s` = smaller): `b1`, `b2`, `s1`, `s2`, `s3`, `s4` - czym wyższy numer tym bardziej tekst jest powiększony / pomniejszony.
* ustawianie na ile kolumn zostanie podzielona piosenka (domyślnie jedna): `columns-2`, `columns-3`
* tag `capo` dodaje informację o tym na jakim progu umieścić kapodaster a `non-polish` dodaje oznaczenie o tym, że piosenka nie jest w języku polskim (pojawi się ono tez w spisie treści, przydatne do szukania czegoś do zaśpiewania ze znajomymi nie znającymi polskiego)

Po generacji plików do druku wygląd może się trochę zmienić - dodawane są np marginesy na oprawę. Natomiast jest to tak rozwiązane że miejsca na treść będzie tyle samo, więc można założyć że jeżeli nie przelewa się na pliku z pojedynczą stroną to będzie tak też w wygenerowanych plikach. Pamiętaj o wywołaniu skryptu `format-songs` przed ostatecznym sprawdzeniem - dodaje on między innymi spacje między akordami, co może wpłynąć na rozjazd tekstu.

# TODO
możliwe że w przyszłości zrobię z tego prywatny pakiet npm