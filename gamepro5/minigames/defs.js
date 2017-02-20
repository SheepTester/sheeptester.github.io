var colours={
  water:'6aa4c8',
  fire:'e0713e',
  ground_stuff:'715d41',
  air:'a8d8e1',
  life:'5ea456',
  space:'23272f'
},
categories={
  water:"water",
  rain:'water',
  fire:'fire',
  metal:'ground_stuff',
  earth:'ground_stuff',
  air:'air',
  vapour:'air',
  cloud:'air',
  wood:"life",
  life:"life",
  star:'space'
},
recps=`
water-fire air
wood-water life
air-water cloud
fire-fire star
cloud-fire vapour
cloud-water rain
`,recipies={},combos={},combofriend={};
(function() {
  recps=recps.split(/\r?\n/).slice(1,-1);
  for (var i=0;i<recps.length;i++) {
    var ingrid1=recps[i].slice(0,recps[i].indexOf('-')),
    ingrid2=recps[i].slice(recps[i].indexOf('-')+1,recps[i].indexOf(' ')),
    result=recps[i].slice(recps[i].indexOf(' ')+1);
    recipies[ingrid1+'_'+ingrid2]=result;
    if (!combos[ingrid1]) {
      combos[ingrid1]=[];
      combofriend[ingrid1]=[];
    }
    combos[ingrid1].push(result);
    combofriend[ingrid1].push(ingrid2);
    if (!combos[ingrid2]) {
      combos[ingrid2]=[];
      combofriend[ingrid2]=[];
    }
    if (ingrid1!==ingrid2) {
      combos[ingrid2].push(result);
      combofriend[ingrid2].push(ingrid1);
    }
  }
}());
