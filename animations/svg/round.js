var input=`C 263.889 148.138 247.361 178.578 244.150 198.950
C 241.113 218.351 225.893 249.505 235.800 258.100
C 244.671 265.690 269.588 244.430 281.950 231.850
C 293.818 219.736 314.144 193.873 305.400 186.400
C 294.822 177.442 264.232 195.539 243.250 198.950
C 223.963 202.085 194.620 215.327 185 206.050
C 177.075 198.310 198.475 173.950 210.600 162.050
C 222.407 150.115 247.092 129.617 254.600 137.900`.split(/\r?\n/);

function round() {
  for (var i=0;i<input.length;i++) {
    var t=input[i].slice(2).split(' ').map(a=>Math.round(Number(a)/10)*10);
    input[i]='C'+t.join(' ');
  }
  return input.join('\n');
}

function maxmin() {
  var rx={max:0,min:1000},ry={max:0,min:1000};
  for (var i=0;i<input.length;i++) {
    var t=input[i].slice(2).split(' ').map(a=>Math.round(Number(a)));
    if (t[4]>rx.max) rx.max=t[4];
    if (t[4]<rx.min) rx.min=t[4];
    if (t[5]>ry.max) ry.max=t[5];
    if (t[5]<ry.min) ry.min=t[5];
  }
  return [rx,ry];
}
