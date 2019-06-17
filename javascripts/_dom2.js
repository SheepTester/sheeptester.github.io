// Helper functions for dancing with the DOM - from Ugwisha

function clean(obj) {
  if (Array.isArray(obj)) return obj.filter(i => i !== undefined && i !== null && i !== false);
  else {
    Object.keys(obj).forEach(prop => (obj[prop] === undefined || obj[prop] === null || obj[prop] === false) && delete obj[prop]);
    return obj;
  }
}
function Elem(tag, data = {}, children = []) {
  const elem = document.createElement(tag);
  Object.keys(clean(data)).forEach(attr => {
    const value = data[attr];
    if (attr === 'data') {
      Object.keys(clean(value)).forEach(attr => {
        elem.dataset[attr] = value[attr];
      });
    } else if (attr === 'style') {
      Object.keys(clean(value)).forEach(prop => {
        if (prop.slice(0, 2) === '--') {
          elem.style.setProperty(prop, value[prop]);
        } else {
          elem.style[prop] = value[prop];
        }
      });
    } else if (attr === 'ripple') {
      rippleify(elem);
    } else if (attr.slice(0, 2) === 'on') {
      elem.addEventListener(attr.slice(2), value);
    } else {
      const strValue = Array.isArray(value) ? clean(value).join(' ') : value.toString();
      if (elem[attr] !== undefined) elem[attr] = strValue;
      else elem.setAttribute(attr, strValue);
    }
  });
  if (!Array.isArray(children)) children = [children];
  clean(children).forEach(child => {
    elem.appendChild(typeof child !== 'object' ? document.createTextNode(child) : child);
  });
  return elem;
}
function Fragment(elems) {
  const fragment = document.createDocumentFragment();
  clean(elems).forEach(e => fragment.appendChild(e));
  return fragment;
}
function empty(elem) {
  while (elem.firstChild) elem.removeChild(elem.firstChild);
}

window.Elem = Elem;
window.Fragment = Fragment;
window.empty = empty;
