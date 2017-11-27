document.addEventListener("DOMContentLoaded",e=>{
  try {
    let footerItemList=document.querySelector('#footer > ul'),
    footerItems=document.querySelectorAll('#footer > ul > li'),
    styleElem=document.createElement("style"),
    sectionDisplayerStyles='';
    for (let i=footerItems.length;i--;) {
      hasMaterialRipple(footerItems[i]);
      sectionDisplayerStyles+=`body.footer-${footerItems[i].id}>.section.${footerItems[i].id}{display:block;}`;
    }
    styleElem.appendChild(document.createTextNode(sectionDisplayerStyles));
    document.head.appendChild(styleElem);
    if (document.body.dataset.theme) document.body.style.setProperty('--theme',document.body.dataset.theme);
    if (document.body.dataset.default) {
      let footerItem=document.querySelector('#'+document.body.dataset.default);
      document.body.classList.add('footer-'+document.body.dataset.default);
      footerItem.classList.add('active');
    }
    function hasMaterialRipple(elem) {
      let lastTapTime=0;
      function onMouseDown(mouseX,mouseY) {
        let ripple=document.createElement("div"),
        elemBoundingRect=elem.getBoundingClientRect(),
        startTime=new Date().getTime(),
        growDistance=Math.hypot(
          Math.max(elemBoundingRect.right-mouseX,mouseX-elemBoundingRect.left),
          Math.max(elemBoundingRect.bottom-mouseY,mouseY-elemBoundingRect.top)
        )/5,
        growDuration=growDistance*31,
        fading=false,
        fadeStartTime;
        ripple.classList.add('ripple');
        ripple.style.left=(mouseX-elemBoundingRect.left)+'px';
        ripple.style.top=(mouseY-elemBoundingRect.top)+'px';
        elem.appendChild(ripple);
        function cubicEaseOut(currentTime) {
          currentTime=currentTime/growDuration-1;
        	return growDistance*(currentTime*currentTime*currentTime+1);
        }
        function updateRippleSize() {
          let currentTime=new Date().getTime(),
          elapsedTime=currentTime-startTime,
          fade;
          if (fading) {
            fade=1-(currentTime-fadeStartTime)/500;
            if (fade<0) {
              elem.removeChild(ripple);
              ripple=null;
              return;
            }
          }
          if (elapsedTime>growDuration) ripple.style.transform=`scale(${growDistance})`;
          else ripple.style.transform=`scale(${cubicEaseOut(elapsedTime)})`;
          if (fading) ripple.style.opacity=fade;
          else ripple.style.opacity=1;
          window.requestAnimationFrame(updateRippleSize);
        }
        function onMouseUp(e) {
          fading=true,fadeStartTime=new Date().getTime();
          document.removeEventListener('mouseup',onMouseUp,false);
          document.removeEventListener('touchend',onMouseUp,false);
          if (e.type==="touchend") lastTapTime=fadeStartTime;
        }
        updateRippleSize();
        document.addEventListener('mouseup',onMouseUp,false);
        document.addEventListener('touchend',onMouseUp,false);
      }
      elem.addEventListener("mousedown",e=>{
        if (new Date().getTime()-lastTapTime>100) onMouseDown(e.clientX,e.clientY);
      },false);
      elem.addEventListener("touchstart",e=>{
        onMouseDown(e.touches[0].clientX,e.touches[0].clientY);
      },false);
    }
    function footerItemClicked(e) { // runs when a footer item is clicked
      if (e.target!==footerItemList&&footerItemList.contains(e.target)) { // make sure we actually clicked on a footer item
        let activeItem=footerItemList.querySelector('.active'),
        liElem=e.target;
        if (activeItem) { // make the currently selected tab not selected anymore
          activeItem.classList.remove('active');
          document.body.classList.remove('footer-'+activeItem.id);
        }
        while (liElem.tagName!=="LI") liElem=e.target.parentNode; // make sure liElem is the li element, not one of its children
        liElem.classList.add('active');
        document.body.classList.add('footer-'+liElem.id);
      }
    }
    footerItemList.addEventListener("click",footerItemClicked,false);
    footerItemList.addEventListener("keydown",e=>{
      if (e.keyCode===13) footerItemClicked(e);
    },false);
  } catch (e) {
    // make errors obnoxious because people don't know how to check the JS console :/
    console.error(e);
    alert(e);
  }
},false);
