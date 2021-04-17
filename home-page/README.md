# Home page

Mainly for HTML whitespace reasons, I decided to make a parser to parse
SCSS-like syntax to generate HTML.

## Build

```sh
node home-page/imitation-scss-parser.js home-page/index.html.scss index.html \
  home-page/style.css
```

## Development

```sh
http-server -c-1 -s &
nodemon --watch home-page --ext scss,yml,js home-page/imitation-scss-parser.js \
  home-page/index.html.scss index.html home-page/style.css
```

http://localhost:8080/
