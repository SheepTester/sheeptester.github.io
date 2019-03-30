// make this old with old browsers, so use var
(function() {
  var redirects = {
    platformre: 'https://sheeptester.github.io/platformre/',
    plat: 'https://sheeptester.github.io/platformre/',
    makelevel: 'https://sheeptester.github.io/platformre/maker/',
    gamepro5: 'https://www.youtube.com/Gamepro5',
    panthre: 'https://www.youtube.com/channel/UCS5jP47FySoyh7tXYHDwQoA',
    penland: 'https://sheeptester.github.io/platformre/penland/inv.html',
    hotel: 'http://thingkingland-com.stackstaging.com/thehotel/',
    spam: 'http://thingkingland-com.stackstaging.com/spammer/',
    dairy: 'http://thingkingland-com.stackstaging.com/mysql/dairy.php',
    gaffasaurus: 'https://www.youtube.com/channel/UCrvlbaPVXWjHGG3YtelpbNw/',
    noskillzjusthacks: 'https://www.youtube.com/channel/UCEAF8wDyCTKDIiVHnnu7a2Q',
    slime:  'https://www.youtube.com/channel/UCN9TtguBmgxMbJVybmSvK1A',
    tbn:  'https://www.youtube.com/channel/UCsiVttOJIEF7hqFuv6orM5A'
  };
  if (window.location.search) {
    var redirect = window.location.search.slice(1);
    if (redirects.hasOwnProperty(redirect)) window.location.replace(redirects[redirect]);
    else if (redirect.slice(0, 2).toLowerCase() === 'rr') window.location.replace('https://i.cloudup.com/LE0xyc4dgp.mp4');
    else if (redirect.slice(0, 2).toLowerCase() === 'js') window.location.replace('https://akk.li/video/jeff.mp4');
    else if (redirect.slice(0, 3).toLowerCase() === 'try') window.location.replace('https://www.google.com/#tbm=isch&q=trypophobia');
    else if (redirect.slice(0, 11) === 'javascript:') console.log('%ceval is evil','color:red;font-size:100px;');
    else if (redirect[0] === '.') {
      var replacers = {
        j: 'javascripts',
        p: 'platformre',
        a: 'animations',
        s: 'sentence',
        h: 'happynumbers',
        b: 'htmlblocks',
        m: 'minigames',
        w: 'words-go-here',
        c: 'words-go-here/misc',
        g: 'gamepro5'
      };
      redirect = redirect.slice(1).replace('.', '.html'), layers = [];
      for (var i = 0; i < redirect.length; i++) {
        if (redirect[i] !== redirect[i].toLowerCase()) {
          layers.push(redirect.slice(0, i).toLowerCase());
          redirect = redirect.slice(i);
          i = 0;
        }
      }
      layers.push(redirect.toLowerCase());
      for (var i = 0; i < layers.length; i++) {
        if (replacers.hasOwnProperty(layers[i])) {
          layers[i] = replacers[layers[i]];
        }
      }
      // removed `'/' + ` here because /?.S would go to //sentence
      window.location.replace(layers.join('/'));
    }
  }
})();
