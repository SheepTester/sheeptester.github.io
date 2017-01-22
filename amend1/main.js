(_=>{
	var s=document.querySelectorAll('a');
  for (var i=0;i<s.length;i++) if (!s[i].href) s[i].href='https://'+s[i].textContent;
})();
