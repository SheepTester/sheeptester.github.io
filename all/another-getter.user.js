// ==UserScript==
// @name         SheepTester/all getter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  generate links to everything
// @author       You
// @match        https://github.com/SheepTester/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // use this to reset:
    // localStorage.STallReset = 'bleh';

    const regex = /\/SheepTester\/([0-9a-zA-Z.-]+)(?:\/tree\/master((?:\/[0-9a-zA-Z.-]+)+))?/;
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const fileSel = '.files .js-navigation-item:not(.up-tree)';
    const seenColour = 'limegreen';
    const notYetColour = 'indianred';
    const newColour = 'darkgreen';
    function getDirPath(url) {
        const urlMatch = regex.exec(url);
        if (!urlMatch) return false;
        let [_, repo, path] = urlMatch;
        if (!path) path = '';
        if (repo !== 'sheeptester.github.io') {
            path = '/' + repo + path;
        }
        return path + '/';
    }

    function test() {
        const parsedURL = getDirPath(location.href);
        if (parsedURL) {
            $('.files').classList.add('wiggles');
            if (localStorage.STallReset !== 'done') {
                localStorage.STallReset = 'done';
                localStorage.STallDir = '[]';
                localStorage.STallFiles = '[]';
            }
            const scannedDirs = JSON.parse(localStorage.STallDir);
            const files = $$(fileSel);
            const scannedFiles = JSON.parse(localStorage.STallFiles);
            files.forEach(f => {
                f = f.querySelector('a');
                if (f.href.includes('blob/master')) {
                    if (scannedFiles.includes(parsedURL + f.textContent)) {
                        f.style.color = seenColour;
                    } else {
                        scannedFiles.push(parsedURL + f.textContent);
                        f.style.color = newColour;
                    }
                } else {
                    const path = getDirPath(f.href);
                    if (path) {
                        f.style.color = scannedDirs.includes(path) ? seenColour : notYetColour;
                    }
                }
            });
            if (!scannedDirs.includes(parsedURL)) scannedDirs.push(parsedURL);
            localStorage.STallDir = JSON.stringify(scannedDirs);
            localStorage.STallFiles = JSON.stringify(scannedFiles);
        }
    }
    test();

    let lastURL = location.href;
    setInterval(() => {
        if (lastURL !== location.href && !$('.is-loading') && !$('.wiggles') && $$(fileSel).length) {
            lastURL = location.href;
            test();
        }
    }, 10);
})();
