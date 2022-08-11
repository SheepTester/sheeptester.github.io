# How to update /all/

You'll need to create a `basic-gh-auth.json` file in the /all/ directory based
on `basic-gh-auth.example.json`. Use your GitHub username, and you can get the
personal access token at https://github.com/settings/tokens.

You can just run

```sh
npm run all
```

`all/get-all.js` gets all the files on the website.

`all/gen.js` generates the /all/ files.

`all/gh-pages-repos.js` lists the repos with GitHub Pages.
