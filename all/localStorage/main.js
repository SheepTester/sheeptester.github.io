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
