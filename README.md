# Instalacja
```
npm i
```

# Struktura plików
Repozytorium z piosenkami powinno być obok repozytorium `songbook-generator` ze względu na ścieżki do styli ustawione na sztywno:
```
Root
├── songbook-generator
└── moj-maly-spiewniczek
    └── songs
```

# Skrypty
dodaj nową stronę z dwoma piosenkami, pierwsza 2 kolumnowa, druga 1 kolumnowa:
```
node .\scripts\add-page.js ..\repo-ze-spiewnikiem 2 1
```

formatuj pliki html z piosenkami:
```
node .\scripts\format-songs.js ..\repo-ze-spiewnikiem
```