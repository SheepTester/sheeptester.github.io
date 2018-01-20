let urlParams = {};
if (window.location.search) {
  let params = window.location.search.slice(1).split("&");
  for (let i = params.length; i--;) {
    let equalPos = params[i].indexOf("=");
    if (~equalPos) {
      urlParams[params[i].slice(0, equalPos)] = params[i].slice(equalPos + 1);
    } else {
      urlParams[params[i]] = null;
    }
  }
}
document.addEventListener("DOMContentLoaded", e => {
  if (urlParams.prop) {
    //
  } else {
    document.body.classList.add("list-view");
    const list = document.querySelector("#list");
    for (let prop in localStorage) {
      if (!localStorage.hasOwnProperty(prop)) continue;
      let link = document.createElement("a"),
      select = document.createElement("button"),
      name = document.createElement("span"),
      value = document.createElement("span");
      link.href = "?prop=" + encodeURIComponent(prop);
      select.className = "material-btn icon ripple-light";
      name.textContent = prop;
      value.textContent = localStorage[prop];
      link.appendChild(select);
      link.appendChild(name);
      link.appendChild(value);
      list.appendChild(link);
    }
  }
}, false);
