# Vows, Please

A small pixel-art browser game. Everything runs from `index.html` with no outside resources, and progress is kept in the browser's local storage.

The game content is encrypted (AES-256-GCM, key from PBKDF2-SHA256). You need the password to play.

## Hosting

Enable GitHub Pages for this repository (Settings > Pages > deploy from branch, root folder). Open the Pages URL and enter the password.

## Editing

The readable source is not stored in the repo. To edit:

```
node tools/unpack.mjs      # asks for the password, writes src/game.js
# edit src/game.js
node tools/build.mjs       # asks for the password, rewrites payload.js
```

`src/` is git-ignored so the plain source never gets committed. Needs Node 18 or newer.
