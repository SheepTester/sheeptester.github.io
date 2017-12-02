try {
  window.cookie = localStorage;
} catch (error) {
  window.cookie = {
    getItem(key) {
      return this[key];
    },
    setItem(key, value) {
      this[key] = value;
    },
    removeItem(key) {
      delete this[key];
    }
  };
}
window.SHEEP = {
  preferences: JSON.parse(cookie.preferences||'{}'),
  getPref(name, defaultValue) {
    if (this.preferences[name] !== undefined) return this.preferences[name];
    else return defaultValue;
  },
  setPref(name, value) {
    this.preferences[name] = value;
    cookie.preferences = JSON.stringify(this.preferences);
    return value;
  },
  ajax(url, callback, error = () => {}) {
    // TO FUTURE SEANS: don't forget about SHEEP.getAjaxCode()
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4) {
        xmlHttp.status === 200 ? callback(xmlHttp.responseText) : error(xmlHttp.responseText, xmlHttp.status);
      }
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  },
  getAjaxCode() { // I've always been using SHEEP.ajax to get the function
    return this.ajax.toString();
  },
  menuItems: [],
  menuActions: [],
  registerMenuItem(label, action, insertIndex) {
    if (insertIndex) {
      this.menuItems.splice(insertIndex, 0, label);
      this.menuActions.splice(insertIndex, 0, action);
    } else {
      this.menuItems.push(label);
      this.menuActions.push(action);
    }
  },
  escapeHTML(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
};
document.addEventListener("DOMContentLoaded", e => {
  let homeButton = document.createElement("sheep-btn"),
  notifications = document.createElement("sheep-notif-wrapper"),
  contextMenu = document.createElement("sheep-contextmenu"),
  shadow = document.createElement("sheep-shadow"),
  blockRightClick = false;

  homeButton.style.right = SHEEP.getPref('sheepBtnX', 10) + 'px';
  homeButton.style.bottom = SHEEP.getPref('sheepBtnY', 10) + 'px';
  homeButton.setAttribute('tabindex', 0);

  function leave() {
    document.body.appendChild(shadow);
    document.body.classList.add('sheep-blockscreen');
    setTimeout(() => {
      // window.location = 'https://sheeptester.github.io/#delsxafet';
      location.reload(); // TEMP
    },500);
  }

  function displayContextMenu(x, y, touch) {
    let clientRect,
    outsideClick = e => {
      if (document.body.contains(contextMenu) && !contextMenu.contains(e.target)) {
        blockRightClick = false;
        document.removeEventListener("mousedown", outsideClick, false);
        document.body.removeChild(contextMenu);
      }
    };
    if (touch) contextMenu.classList.add('sheep-touch');
    else contextMenu.classList.remove('sheep-touch');
    while (contextMenu.hasChildNodes()) contextMenu.removeChild(contextMenu.lastChild);
    for (let i = 0; i < SHEEP.menuItems.length; i++) {
      let menuItem = document.createElement("sheep-context-item");
      menuItem.textContent = SHEEP.menuItems[i];
      menuItem.setAttribute('tabindex', 0);
      menuItem.addEventListener("click", e => {
        SHEEP.menuActions[i]();
        blockRightClick = false;
        document.removeEventListener("click", outsideClick, false);
        document.body.removeChild(contextMenu);
      }, false);
      contextMenu.appendChild(menuItem);
    }
    document.body.appendChild(contextMenu);
    clientRect = contextMenu.getBoundingClientRect();
    if (x > window.innerWidth / 2) contextMenu.style.left = (x - clientRect.width) + 'px';
    else contextMenu.style.left = x + 'px';
    if (y > window.innerHeight / 2) contextMenu.style.top = (y - clientRect.height) + 'px';
    else contextMenu.style.top = y + 'px';
    blockRightClick = true;
    document.addEventListener("mousedown", outsideClick, false);
  }
  homeButton.addEventListener("contextmenu", e=>{
    if (blockRightClick) e.preventDefault();
  }, false);
  contextMenu.addEventListener("contextmenu", e=>{
    e.preventDefault();
  }, false);
  if (window.location.pathname !== '/') {
    SHEEP.registerMenuItem('go to index page', () => leave());
  }
  SHEEP.registerMenuItem("reset l' ŝafeto position", () => {
    SHEEP.setPref('sheepBtnX', SHEEP.setPref('sheepBtnY', 10));
    homeButton.style.right = homeButton.style.bottom = '10px';
  });
  SHEEP.registerMenuItem('view page description', () => {
    let description=document.querySelector('meta[name=description]');
    if (description) SHEEP.notify(`<h1>${document.title}</h1><p>${SHEEP.escapeHTML(description.content)}</p>`);
    else SHEEP.notify(`<h1>${document.title}</h1><p><em>This page has no description.</em></p>`);
  });

  function drag(mouseDownName, mouseMoveName, mouseUpName, eventOptions, isTouch) {
    homeButton.addEventListener(mouseDownName, e => {
      if (!isTouch) {
        if (e.which === 3) {
          if (blockRightClick) blockRightClick = false;
          else {
            let up = e => {
              displayContextMenu(e.clientX, e.clientY, false);
              document.removeEventListener(mouseUpName, up, eventOptions);
              e.preventDefault();
            };
            document.addEventListener(mouseUpName, up, eventOptions);
          }
          return;
        } else if (e.touches) {
          return;
        }
      }
      let cursorPos = isTouch ? e.touches[0] : e,
      clientRect = homeButton.getBoundingClientRect(),
      originalX = cursorPos.clientX,
      originalY = cursorPos.clientY,
      xOffset = originalX - clientRect.left,
      yOffset = originalY - clientRect.top,
      dragging = false,
      menuTimeout,
      openMenu,
      move = e => {
        let cursorPos = isTouch ? e.touches[0] : e;
        if (!dragging&&Math.hypot(originalX - cursorPos.clientX, originalY - cursorPos.clientY) > 5) {
          dragging = true;
          homeButton.style.right = homeButton.style.bottom = null;
          document.body.classList.add('sheep-dragging');
          document.body.appendChild(shadow);
        }
        if (dragging) {
          homeButton.style.left = (cursorPos.clientX - xOffset) + 'px';
          homeButton.style.top = (cursorPos.clientY - yOffset) + 'px';
        }
        e.preventDefault();
      },
      up = e => {
        if (dragging) {
          let newClientRect = homeButton.getBoundingClientRect();
          homeButton.style.top = homeButton.style.left = null;
          homeButton.style.right = SHEEP.setPref('sheepBtnX', window.innerWidth - newClientRect.right) + 'px';
          homeButton.style.bottom = SHEEP.setPref('sheepBtnY', window.innerHeight - newClientRect.bottom) + 'px';
          document.body.classList.remove('sheep-dragging');
          document.body.removeChild(shadow);
        } else if (isTouch&&openMenu) {
          displayContextMenu(originalX, originalY, true);
          document.body.classList.remove('sheep-will-open-context-menu');
        } else {
          leave();
        }
        if (isTouch) clearTimeout(menuTimeout);
        document.removeEventListener(mouseMoveName, move, eventOptions);
        document.removeEventListener(mouseUpName, up, eventOptions);
        e.preventDefault();
      };
      if (isTouch) {
        openMenu = false;
        menuTimeout = setTimeout(()=>{
          openMenu = true;
          document.body.classList.add('sheep-will-open-context-menu');
        },700);
      }
      document.addEventListener(mouseMoveName, move, eventOptions);
      document.addEventListener(mouseUpName, up, eventOptions);
    },false);
  }
  drag('mousedown', 'mousemove', 'mouseup', false, false);
  drag('touchstart', 'touchmove', 'touchend', {passive:false}, true);

  document.body.appendChild(homeButton);

  SHEEP.notify = (content, onclick, dismissTime = -1) => {
    let notification = document.createElement("sheep-notification"),
    timeout;
    notification.innerHTML=content;
    notification.setAttribute('tabindex', 0);
    function dismiss() {
      notification.classList.add('dismissing');
      notification.style.maxHeight = notification.style.padding = null;
      if (notification === notifications.lastChild) notification.style.marginBottom = '10px';
      setTimeout(() => {
        notifications.removeChild(notification);
        if (!notifications.children.length) document.body.removeChild(notifications);
      },200);
      if (timeout) clearTimeout(timeout);
    }
    notification.addEventListener("click", e => {
      if (typeof onclick === 'function') onclick();
      dismiss();
    }, false);
    notification.addEventListener("keydown", e => {
      if (e.keyCode === 13) {
        if (typeof onclick === 'function') onclick();
        dismiss();
      }
    }, false);
    if (dismissTime >= 0) timeout = setTimeout(dismiss, dismissTime);
    else if (typeof onclick !== 'function') notification.dataset.closeMessage='Click to close';
    notifications.appendChild(notification);
    document.body.appendChild(notifications);
    setTimeout(() => {
      notification.style.maxHeight = notification.scrollHeight + 'px';
      notification.style.padding = '10px';
    },0);
  };
},false);
