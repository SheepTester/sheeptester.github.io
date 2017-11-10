// ==UserScript==
// @name         file getter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  get files
// @author       You
// @match        https://github.com/SheepTester/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  function wee() {
    var url=location.pathname.slice(location.pathname.slice(1).indexOf('/')+2).split('/');
    if (url[2]==='master') url.splice(2,1);
    if (url[1]==='tree') url.splice(1,1);
    if (url[0]==='sheeptester.github.io') url.splice(0,1);
    var items=document.querySelectorAll('.files .js-navigation-item:not(.up-tree)');
    var original=JSON.parse(localStorage.boof),
        files=original;
    for (let i=0;i<url.length;i++) {
      if (!files[url[i]]) files[url[i]]={['']:[]};
      files=files[url[i]];
    }
    for (let i=0;i<items.length;i++) {
      var content=items[i].querySelector('.content a').textContent;
      if (items[i].querySelector('.octicon-file-directory')) {
        if (~content.indexOf('/')) {
          var voof=content.split('/'),
              temp=files;
          for (let j=0;j<voof.length;j++) {
            if (!temp[voof[j]]) temp[voof[j]]={['']:[]};
            temp=temp[voof[j]];
          }
          items[i].style.background='skyblue';
        } else {
          if (files[content]) items[i].style.background=files[content][''].length?'palevioletred':'lightseagreen';
          else files[content]={['']:[]},items[i].style.background='yellowgreen';
        }
      } else {
        if (~files[''].indexOf(content)) items[i].style.background='palevioletred';
        else files[''].push(content),items[i].style.background='yellowgreen';
      }
    }
    console.log(url,items,original);
    localStorage.boof=JSON.stringify(original);
  }
  setTimeout(wee,300);
  var lasturl=document.querySelector('.files .js-navigation-item:not(.up-tree)').parentNode.textContent;
  setInterval(()=>{
    if (lasturl!==document.querySelector('.files .js-navigation-item:not(.up-tree)').parentNode.textContent) {
      lasturl=document.querySelector('.files .js-navigation-item:not(.up-tree)').parentNode.textContent;
      setTimeout(wee,300);
    }
  },100);
})();
