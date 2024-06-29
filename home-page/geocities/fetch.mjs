// Run in home-page/geocities/

import fs from 'fs/promises'

const imageUrls = [
  {
    name: 'pocky',
    url: 'https://pixels.crd.co/assets/images/gallery02/ef5b5dd5.gif?v=7212058b'
  },
  {
    name: 'strawberry !?',
    url: 'https://pixels.crd.co/assets/images/gallery05/14843ed9.gif?v=7212058b'
  },
  {
    name: 'strawberry',
    url: 'https://pixels.crd.co/assets/images/gallery27/9f947404.gif?v=7212058b'
  },
  {
    name: 'ramen',
    url: 'https://pixels.crd.co/assets/images/gallery33/6746fc14.gif?v=7212058b'
  },
  {
    name: 'cat stretch',
    url: 'https://pixels.crd.co/assets/images/gallery40/78dde270.gif?v=7212058b'
  },
  {
    name: 'miku',
    url: 'https://pixels.crd.co/assets/images/gallery03/a56d4efc.gif?v=7212058b'
  },
  {
    name: 'spinning frog',
    url: 'https://pixels.crd.co/assets/images/gallery41/064742e8.gif?v=7212058b'
  },
  {
    name: 'fan',
    url: 'https://pixels.crd.co/assets/images/gallery46/f3f368da.gif?v=7212058b'
  },
  {
    name: 'bug',
    url: 'https://pixels.crd.co/assets/images/gallery55/00955a40.gif?v=7212058b'
  },
  {
    name: 'kitkat',
    url: 'https://pixels.crd.co/assets/images/gallery39/d96dff72.gif?v=7212058b'
  },
  {
    name: 'bunny',
    url: 'https://pixels.crd.co/assets/images/gallery42/f3775c51.gif?v=7212058b'
  },
  {
    name: 'squid',
    url: 'https://pixels.crd.co/assets/images/gallery42/3d81ca68.gif?v=7212058b'
  },
  {
    name: 'ghibli critter with green onion',
    url: 'https://pixels.crd.co/assets/images/gallery42/a637cec9.gif?v=7212058b'
  },
  {
    name: 'candle',
    url: 'https://pixels.crd.co/assets/images/gallery29/aad3ee22.gif?v=7212058b'
  },
  {
    name: 'sunset',
    url: 'https://pixels.crd.co/assets/images/gallery56/541c2cc4.gif?v=7212058b'
  },
  {
    name: 'rainbow cat',
    url: 'https://pixels.crd.co/assets/images/gallery56/ca93c8ed.gif?v=7212058b'
  },
  {
    name: 'paw',
    url: 'https://pixels.crd.co/assets/images/gallery06/85872082.gif?v=7212058b'
  },
  {
    name: 'paw point right',
    url: 'https://pixels.crd.co/assets/images/gallery06/c3055e59.gif?v=7212058b'
  },
  {
    name: 'computer',
    url: 'https://pixels.crd.co/assets/images/gallery20/49144169.gif?v=7212058b'
  },
  {
    name: 'black cat',
    url: 'https://pixels.crd.co/assets/images/gallery20/c7a11400.gif?v=7212058b'
  },
  {
    name: 'miku blink',
    url: 'https://pixels.crd.co/assets/images/gallery03/32442349.gif?v=7212058b'
  },
  {
    name: 'tv',
    url: 'https://pixels.crd.co/assets/images/gallery21/8101d0a3.gif?v=7212058b'
  },
  {
    name: 'blow dandilion',
    url: 'https://pixels.crd.co/assets/images/gallery72/5686d3df.gif?v=7212058b'
  },
  {
    name: 'graphic design is my passion',
    url: 'https://plasticdino.neocities.org/buttons/graphicdesign.png'
  },
  {
    name: 'i use ms paint',
    url: 'https://plasticdino.neocities.org/buttons/ms%20paint.gif'
  },
  {
    name: 'minecraft',
    url: 'https://plasticdino.neocities.org/buttons/minecraft.png'
  },
  {
    name: 'miku approved',
    url: 'https://plasticdino.neocities.org/buttons/miku.gif'
  },
  {
    name: 'windows media player',
    url: 'https://plasticdino.neocities.org/buttons/mediaplayer.jpg'
  },
  {
    name: 'chrome evil',
    url: 'https://plasticdino.neocities.org/buttons/chrome.gif'
  },
  {
    name: 'powered by imagination',
    url: 'https://plasticdino.neocities.org/buttons/imagine.gif'
  },
  {
    name: 'freeware',
    url: 'https://plasticdino.neocities.org/buttons/freeware.gif'
  },
  {
    name: 'social distancing survivor 2020',
    url: 'https://plasticdino.neocities.org/buttons/2020SUCKS.png'
  },
  {
    name: 'hell on the web',
    url: 'https://plasticdino.neocities.org/buttons/hellontheweb.gif'
  },
  {
    name: 'emoticon',
    url: 'https://plasticdino.neocities.org/buttons/wow-wow.gif'
  },
  {
    name: 'strawberry',
    url: 'https://plasticdino.neocities.org/buttons/strawberry.gif'
  },
  {
    name: 'my music',
    url: 'https://plasticdino.neocities.org/buttons/music.gif'
  },
  { name: 'lol', url: 'https://plasticdino.neocities.org/buttons/lol.gif' },
  {
    name: 'freeware guide',
    url: 'https://plasticdino.neocities.org/buttons/freewareguide.gif'
  },
  {
    name: 'ubo now',
    url: 'https://plasticdino.neocities.org/buttons/ublock-now.png'
  },
  {
    name: 'free stuff',
    url: 'https://plasticdino.neocities.org/buttons/amazing_free_stuff.gif'
  },
  {
    name: '2000 windows now anime girl',
    url: 'https://plasticdino.neocities.org/buttons/2ktan.png'
  },
  {
    name: 'wikia sucks',
    url: 'https://plasticdino.neocities.org/buttons/wikia.gif'
  },
  {
    name: 'capybara now',
    url: 'https://plasticdino.neocities.org/buttons/capybaraNOW.png'
  },
  {
    name: 'cats',
    url: 'https://plasticdino.neocities.org/buttons/kittyrun.gif'
  },
  {
    name: 'wikipedia',
    url: 'https://plasticdino.neocities.org/badges/wikipedia.gif'
  },
  {
    name: 'windows',
    url: 'https://plasticdino.neocities.org/badges/windows.gif'
  },
  {
    name: '0 religion',
    url: 'https://plasticdino.neocities.org/badges/0religion.gif'
  },
  {
    name: 'w3c hates me',
    url: 'https://plasticdino.neocities.org/badges/W3CHatesMe.gif'
  },
  {
    name: 'thank you for not smoking',
    url: 'https://plasticdino.neocities.org/bumper/nosmoke.gif'
  },
  {
    name: '4 days without an accident',
    url: 'https://plasticdino.neocities.org/bumper/accident.gif'
  },
  {
    name: 'fewer weasels',
    url: 'https://plasticdino.neocities.org/bumper/weasels_web.gif'
  },
  {
    name: 'do not eat',
    url: 'https://plasticdino.neocities.org/bumper/website_do_not_eat.gif'
  },
  {
    name: 'embrace the moon',
    url: 'https://y2k.neocities.org/blinkiez/32992d7o3rismpj.gif'
  },
  {
    name: 'are we alone',
    url: 'https://y2k.neocities.org/blinkiez/1564055h9zarit76d.gif'
  },
  {
    name: 'water drinker',
    url: 'https://y2k.neocities.org/blinkiez/newbatch/A4JMkfi.gif'
  },
  {
    name: 'ask a question',
    url: 'https://y2k.neocities.org/blinkiez/newbatch/lOIaYz4.gif'
  },
  {
    name: 'you are wonderful',
    url: 'https://y2k.neocities.org/blinkiez/tumblr_ocv55xuQnQ1vybv3mo6_250.gif'
  },
  {
    name: 'dream',
    url: 'https://y2k.neocities.org/blinkiez/newbatch/dreamblinkie.gif'
  },
  {
    name: 'best viewed with netscape/ie',
    url: 'https://y2k.neocities.org/buttons/browser7.gif'
  },
  {
    name: 'made with windows',
    url: 'https://y2k.neocities.org/buttons/made_with_windows.gif'
  },
  {
    name: 'best viewed 800x600',
    url: 'https://y2k.neocities.org/buttons/800x600.gif'
  },
  {
    name: 'best 800x600 hi colors',
    url: 'https://y2k.neocities.org/buttons/tumblr_ou69gmb2xM1wvu485o9_100.gif'
  },
  {
    name: 'ms frontpage',
    url: 'https://y2k.neocities.org/buttons/tumblr_static_6wouj8v7cjs4wwgso0g0kgccg.png'
  },
  { name: 'esheep now', url: 'https://y2k.neocities.org/buttons/logo_esh.gif' },
  {
    name: 'winrar click here',
    url: 'https://y2k.neocities.org/buttons/adv_rar2.gif'
  },
  {
    name: 'internet free',
    url: 'https://y2k.neocities.org/buttons/263gggk.gif'
  },
  {
    name: 'best viewed in srgb',
    url: 'https://y2k.neocities.org/buttons/srgb-now.png'
  },
  {
    name: 'happy new year 2006',
    url: 'https://y2k.neocities.org/buttons/tumblr_inline_p0bn5yiKsp1ty2vf6_500.gif'
  },
  {
    name: 'get a computer now',
    url: 'https://y2k.neocities.org/buttons/tumblr_inline_p3vf6gq4o61rv0j40_500.jpg'
  },
  { name: 'got html', url: 'https://y2k.neocities.org/buttons/got_html.gif' },
  { name: 'google', url: 'https://y2k.neocities.org/buttons/google_25wht.gif' },
  { name: 'glitch', url: 'https://y2k.neocities.org/stamps/15.png' },
  {
    name: 'smiley',
    url: 'https://y2k.neocities.org/stamps/awesome_overload_by_mr_stamp.gif'
  },
  {
    name: 'i support randomly screwing around in ms paint',
    url: 'https://y2k.neocities.org/stamps/stamp__support_ms_paint_by_xxsomeoneelsexx.jpg'
  },
  {
    name: 'im gonna eat you',
    url: 'https://y2k.neocities.org/stamps/tumblr_inline_p0x8glfCRf1uzqajc_500.jpg'
  },
  {
    name: 'cat',
    url: 'https://y2k.neocities.org/stamps/tumblr_inline_pe6lbupjD71v11djx_1280.gif'
  },
  {
    name: 'a ufo has appeared! believe',
    url: 'https://y2k.neocities.org/stamps/tumblr_inline_pe6litvpzv1v11djx_1280.gif'
  },
  {
    name: 'cyberbunk',
    url: 'https://y2k.neocities.org/stamps/tumblr_pdu1u6f4Fy1wpplaao3_100.gif'
  },
  {
    name: 'dino',
    url: 'https://y2k.neocities.org/stamps/tumblr_pdu1u6f4Fy1wpplaao6_100.gif'
  },
  {
    name: 'run for your life',
    url: 'https://y2k.neocities.org/stamps/tumblr_inline_pe6lz45uoI1v11djx_1280.png'
  },
  {
    name: 'you must die',
    url: 'https://y2k.neocities.org/stamps/tumblr_inline_pf6lisXxFI1tjl8rj_500.png'
  },
  {
    name: 'incorrect password screen freaks me out',
    url: 'https://y2k.neocities.org/stamps2/tumblr_pyhwgrcMF61y8ua8do1_100.png'
  },
  {
    name: 'cant sleep clowns will eat me',
    url: 'https://y2k.neocities.org/stamps2/tumblr_pyhwgrcMF61y8ua8do1_100.png'
  },
  {
    name: 'proud to be plague rat',
    url: 'https://y2k.neocities.org/stamps/tumblr_pbl4whs7Xl1wlxvjlo4_100.png'
  },
  {
    name: 'am alien',
    url: 'https://y2k.neocities.org/stamps/tumblr_pbl4whs7Xl1wlxvjlo4_100.png'
  },
  {
    name: 'balloons',
    url: 'https://y2k.neocities.org/stamps/tumblr_pbbaqrNazy1xz2nuuo3_100.gif'
  },
  {
    name: 'you are dead',
    url: 'https://y2k.neocities.org/stamps/tumblr_pbbaqrNazy1xz2nuuo8_100.jpg'
  },
  {
    name: 'miku dance',
    url: 'https://y2k.neocities.org/stamps/tumblr_pbbaqrNazy1xz2nuuo8_100.jpg'
  },
  {
    name: 'this is how i feel',
    url: 'https://y2k.neocities.org/stamps2/this_is_how_i_feel_by_mr_stamp.gif'
  },
  {
    name: 'i support lgbt rights',
    url: 'https://y2k.neocities.org/stamps2/tumblr_inline_phwim6Kdtr1w0aona_500.gif'
  },
  {
    name: 'i didnt survive 2016',
    url: 'https://y2k.neocities.org/stamps2/tumblr_inline_plj6czywpQ1vsqiz2_500.png'
  },
  {
    name: 'delete system 32',
    url: 'https://y2k.neocities.org/stamps2/untitled_by_theartofnotlikingyou-d6lqqe6.gif'
  },
  {
    name: 'happy thoughts your way',
    url: 'https://y2k.neocities.org/stamps/sa_by_dragondear-dbjnlgf.png'
  },
  {
    name: 'spinning dvd',
    url: 'https://gifcity.carrd.co/assets/images/gallery120/dd3337c3.gif?v=b2f08ae6'
  },
  {
    name: 'balls',
    url: 'https://gifcity.carrd.co/assets/images/gallery76/0fe7d15c.gif?v=b2f08ae6'
  },
  {
    name: 'house',
    url: 'https://gifcity.carrd.co/assets/images/gallery251/59804502.gif?v=b2f08ae6'
  },
  {
    name: 'newtons cradle',
    url: 'https://gifcity.carrd.co/assets/images/gallery77/9090fe5e.gif?v=b2f08ae6'
  },
  {
    name: 'lava lamp',
    url: 'https://gifcity.carrd.co/assets/images/gallery252/5e9e64d3.gif?v=b2f08ae6'
  },
  {
    name: 'cat with wings',
    url: 'https://gifcity.carrd.co/assets/images/gallery125/277c992f.gif?v=b2f08ae6'
  },
  {
    name: 'gears',
    url: 'https://gifcity.carrd.co/assets/images/gallery255/cd7cff55.gif?v=b2f08ae6'
  },
  {
    name: 'rings',
    url: 'https://gifcity.carrd.co/assets/images/gallery78/c98685b3.gif?v=b2f08ae6'
  },
  {
    name: 'happy face',
    url: 'https://gifcity.carrd.co/assets/images/gallery79/5ec461f3.gif?v=b2f08ae6'
  },
  {
    name: 'facedesk',
    url: 'https://gifcity.carrd.co/assets/images/gallery79/ac0a5518.gif?v=b2f08ae6'
  },
  {
    name: 'windows neko',
    url: 'https://gifcity.carrd.co/assets/images/gallery81/a0064aa4.gif?v=b2f08ae6'
  },
  {
    name: 'earth',
    url: 'https://gifcity.carrd.co/assets/images/gallery81/9aa47f49.gif?v=b2f08ae6'
  },
  {
    name: 'computer',
    url: 'https://gifcity.carrd.co/assets/images/gallery81/98a8a387.gif?v=b2f08ae6'
  },
  {
    name: 'purple face',
    url: 'https://gifcity.carrd.co/assets/images/gallery82/b7928d7d.png?v=b2f08ae6'
  },
  {
    name: 'candle',
    url: 'https://gifcity.carrd.co/assets/images/gallery258/b07ad4c9.gif?v=b2f08ae6'
  },
  {
    name: 'construction',
    url: 'https://gifcity.carrd.co/assets/images/gallery79/13765fc0.gif?v=b2f08ae6'
  },
  {
    name: 'heart',
    url: 'https://gifcity.carrd.co/assets/images/gallery83/53b3b3f1.gif?v=b2f08ae6'
  },
  {
    name: 'melted bunny',
    url: 'https://gifcity.carrd.co/assets/images/gallery84/03409036.gif?v=b2f08ae6'
  },
  {
    name: 'rotating cat',
    url: 'https://gifcity.carrd.co/assets/images/gallery84/d873fbef.gif?v=b2f08ae6'
  },
  {
    name: 'moon',
    url: 'https://gifcity.carrd.co/assets/images/gallery85/30796f13.gif?v=b2f0v8ae6'
  },
  {
    name: 'exploding barrel',
    url: 'https://gifcity.carrd.co/assets/images/gallery135/765519c3.gif?v=b2f08ae6'
  },
  {
    name: 'jewel',
    url: 'https://gifcity.carrd.co/assets/images/gallery251/caf5cbcf.gif?v=b2f08ae6'
  },
  {
    name: 'paint',
    url: 'https://gifcity.carrd.co/assets/images/gallery38/44c03741.gif?v=b2f08ae6'
  },
  {
    name: 'christmas lights',
    url: 'https://gifcity.carrd.co/assets/images/gallery38/64419efb.gif?v=b2f08ae6'
  },
  {
    name: 'sparkles',
    url: 'https://gifcity.carrd.co/assets/images/gallery38/ce1c7842.gif?v=b2f08ae6'
  },
  {
    name: 'stars',
    url: 'https://gifcity.carrd.co/assets/images/gallery38/8906e0c6.gif?v=b2f08ae6'
  },
  {
    name: 'spiral',
    url: 'https://gifcity.carrd.co/assets/images/gallery38/2f9099c0.gif?v=b2f08ae6'
  },
  {
    name: 'fire',
    url: 'https://gifcity.carrd.co/assets/images/gallery40/0a24ec5b.gif?v=b2f08ae6'
  },
  {
    name: 'dripping green',
    url: 'https://gifcity.carrd.co/assets/images/gallery42/d156e71b.gif?v=b2f08ae6'
  },
  {
    name: 'shark',
    url: 'https://gifcity.carrd.co/assets/images/gallery44/e9ecabff.gif?v=b2f08ae6'
  },
  {
    name: 'spinning sword',
    url: 'https://gifcity.carrd.co/assets/images/gallery45/0c3918be.gif?v=b2f08ae6'
  },
  {
    name: 'skulls',
    url: 'https://gifcity.carrd.co/assets/images/gallery49/62c5c338.gif?v=b2f08ae6'
  },
  {
    name: 'under construction',
    url: 'http://textfiles.com/underconstruction/mamagnolia_acresunderconstruction.gif'
  },
  {
    name: 'workers',
    url: 'http://textfiles.com/underconstruction/NaNapaValleyVineyard9035construction.gif'
  },
  {
    name: 'spinning construction sign',
    url: 'http://textfiles.com/underconstruction/luvsisqounderconstruction_rotating_triangle.gif'
  },
  {
    name: 'spaceship',
    url: 'https://www.cameronsworld.net/img/content/1/9.gif'
  },
  { name: 'star', url: 'https://www.cameronsworld.net/img/content/1/16.gif' },
  {
    name: 'eclipse',
    url: 'https://www.cameronsworld.net/img/content/1/18.gif'
  },
  {
    name: 'ship around planet',
    url: 'https://www.cameronsworld.net/img/content/1/20.gif'
  },
  { name: 'dove', url: 'https://www.cameronsworld.net/img/content/4/14.gif' },
  { name: 'book', url: 'https://www.cameronsworld.net/img/content/5/2.gif' },
  { name: 'skull', url: 'https://www.cameronsworld.net/img/content/5/17.gif' },
  {
    name: 'lantern',
    url: 'https://www.cameronsworld.net/img/content/10/3.png'
  },
  {
    name: '3d cultural head',
    url: 'https://www.cameronsworld.net/img/content/10/10.gif'
  },
  { name: 'bird', url: 'https://www.cameronsworld.net/img/content/10/14.gif' },
  { name: 'fish', url: 'https://www.cameronsworld.net/img/content/11/9.gif' },
  {
    name: 'fish',
    url: 'https://www.cameronsworld.net/img/sprites/sprite11.png'
  },
  { name: 'shark', url: 'https://www.cameronsworld.net/img/content/11/8.gif' },
  { name: 'genie', url: 'https://www.cameronsworld.net/img/content/12/4.gif' },
  {
    name: 'handshake',
    url: 'https://www.cameronsworld.net/img/content/14/7.gif'
  },
  {
    name: 'pyramid',
    url: 'https://www.cameronsworld.net/img/content/13/22.gif'
  },
  { name: 'bug', url: 'https://www.cameronsworld.net/img/content/12/15.gif' },
  {
    name: 'handshake offer',
    url: 'https://www.cameronsworld.net/img/content/14/10.gif'
  },
  {
    name: 'pacing',
    url: 'https://www.cameronsworld.net/img/content/15/42.gif'
  },
  { name: 'home', url: 'https://www.cameronsworld.net/img/content/15/42.gif' },
  {
    name: 'mailbox',
    url: 'https://www.cameronsworld.net/img/content/15/40.gif'
  },
  {
    name: 'hypercube',
    url: 'https://www.cameronsworld.net/img/content/16/3.gif'
  },
  {
    name: 'welcome to internet',
    url: 'https://www.cameronsworld.net/img/content/15/37.gif'
  },
  {
    name: 'updated',
    url: 'https://www.cameronsworld.net/img/content/16/11.gif'
  },
  {
    name: 'rotating chemical structure',
    url: 'https://www.cameronsworld.net/img/content/16/5.gif'
  },
  {
    name: 'spinning counter',
    url: 'https://www.cameronsworld.net/img/content/17/34.gif'
  },
  {
    name: 'blinking asian guy in armor',
    url: 'https://www.cameronsworld.net/img/content/17/26.gif'
  },
  {
    name: 'bird flying',
    url: 'https://www.cameronsworld.net/img/content/17/24.gif'
  },
  {
    name: 'skull trumpet',
    url: 'https://www.cameronsworld.net/img/content/19/26.gif'
  },
  {
    name: 'closing door',
    url: 'https://www.cameronsworld.net/img/content/19/45.gif'
  },
  {
    name: 'spinning skull',
    url: 'https://www.cameronsworld.net/img/content/19/32.gif'
  },
  {
    name: 'scissors',
    url: 'https://www.cameronsworld.net/img/content/20/16.gif'
  },
  {
    name: 'spinning treble clef',
    url: 'https://www.cameronsworld.net/img/content/20/14.gif'
  },
  {
    name: 'vortex',
    url: 'https://www.cameronsworld.net/img/content/21/32.gif'
  },
  {
    name: 'web search',
    url: 'https://www.cameronsworld.net/img/content/21/28.gif'
  },
  {
    name: 'observatory',
    url: 'https://www.cameronsworld.net/img/content/21/13.gif'
  },
  {
    name: 'countdown from 10',
    url: 'https://www.cameronsworld.net/img/content/20/29.gif'
  },
  {
    name: 'spinning music note',
    url: 'https://www.cameronsworld.net/img/content/20/8.gif'
  },
  {
    name: 'guy jamming',
    url: 'https://www.cameronsworld.net/img/content/20/9.gif'
  },
  {
    name: 'astronomía',
    url: 'https://www.cameronsworld.net/img/sprites/sprite21.png'
  },
  {
    name: 'bubblegum jackhammer',
    url: 'https://www.cameronsworld.net/img/content/22/4.gif'
  },
  {
    name: 'agree button',
    url: 'https://www.cameronsworld.net/img/content/23/frame-23/1.png'
  },
  {
    name: 'sparkle cat',
    url: 'https://www.cameronsworld.net/img/content/23/frame-13/1.gif'
  },
  {
    name: 'graphs',
    url: 'https://www.cameronsworld.net/img/content/23/frame-7/2.gif'
  },
  {
    name: 'duck',
    url: 'https://www.cameronsworld.net/img/content/23/frame-6/1.gif'
  },
  {
    name: 'really fast spinning dancers',
    url: 'https://www.cameronsworld.net/img/content/25/7.gif'
  },
  {
    name: 'dancing guy',
    url: 'https://www.cameronsworld.net/img/content/25/13.gif'
  },
  {
    name: 'spinning metal body',
    url: 'https://www.cameronsworld.net/img/content/25/10.gif'
  },
  {
    name: 'spinning milk',
    url: 'https://www.cameronsworld.net/img/content/26/right-side/15.gif'
  },
  { name: 'sheep', url: 'https://www.cameronsworld.net/img/content/27/14.png' },
  {
    name: 'spinning lemon slice',
    url: 'https://www.cameronsworld.net/img/content/30/66.gif'
  },
  {
    name: 'spinning flowers',
    url: 'https://www.cameronsworld.net/img/content/30/23.gif'
  },
  {
    name: 'crazy chinese dragon',
    url: 'https://www.cameronsworld.net/img/sprites/sprite31/middle.png'
  },
  {
    name: 'inferno',
    url: 'https://www.cameronsworld.net/img/content/33/2.gif'
  },
  {
    name: 'hot',
    url: 'https://www.cameronsworld.net/img/sprites/sprite33.png'
  },
  { name: 'new', url: 'https://www.cameronsworld.net/img/content/33/22.gif' },
  {
    name: 'email on fires',
    url: 'https://www.cameronsworld.net/img/content/33/4.gif'
  },
  {
    name: 'balls thru rings',
    url: 'https://www.cameronsworld.net/img/content/21/22.gif'
  }
]

const imageTags = await fs.open('images.html', 'a')

for (const { name, url } of imageUrls) {
  const type = url.endsWith('.png')
    ? 'png'
    : url.endsWith('.jpg') || url.endsWith('.jpeg')
    ? 'jpg'
    : 'gif'
  let count = 1
  while (
    await fs
      .access(`${name.replaceAll('/', '_')}${count === 1 ? '' : count}.${type}`)
      .then(() => true)
      .catch(error => (error.code === 'ENOENT' ? false : Promise.reject(error)))
  ) {
    count++
  }
  const fileName = `${name.replaceAll('/', '_')}${
    count === 1 ? '' : count
  }.${type}`
  await fs.writeFile(
    fileName,
    Buffer.from(await fetch(url).then(r => r.arrayBuffer()))
  )
  await imageTags.write(`<img src="${fileName}" alt="${name}" />\n`)
}

await imageTags.close()
