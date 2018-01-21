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
  if (urlParams.prop || urlParams.new) {
    //
  } else {
    document.body.classList.add("list-view");

    const list = document.querySelector("#list"),
    selectAll = document.querySelector("#selectall"),
    selectionControls = document.querySelector("#selection"),
    selectedCount = document.querySelector("#selectcount"),
    removeBtn = document.querySelector("#remove");

    let selects = [];
    function allSelected() {
      for (let i = selects.length; i--;) if (!selects[i].selected) return false;
      return true;
    }
    function getSelected() {
      let selected = 0;
      for (let i = selects.length; i--;) if (selects[i].selected) selected++;
      return selected;
    }
    function updateSelectionControls() {
      let selected = getSelected();
      selected ? (
        document.body.classList.add("selection"),
        selectedCount.textContent = selected === 1 ? "1 item selected" : selected + " items selected"
      ) : document.body.classList.remove("selection");
    }
    selectAll.addEventListener("click", e => {
      if (selectAll.classList.contains("checked")) {
        selectAll.classList.remove("checked");
        for (let i = selects.length; i--;) if (selects[i].selected) {
          selects[i].wrapper.classList.remove("selected");
          selects[i].selected = false;
        }
      } else {
        selectAll.classList.add("checked");
        for (let i = selects.length; i--;) if (!selects[i].selected) {
          selects[i].wrapper.classList.add("selected");
          selects[i].selected = true;
        }
      }
      updateSelectionControls();
    }, false);

    removeBtn.addEventListener("click", e => {
      for (let i = selects.length; i--;) if (selects[i].selected) {
        localStorage.removeItem(selects[i].prop);
        list.removeChild(selects[i].wrapper);
        selects.splice(i, 1);
        selectAll.classList.remove("checked");
        updateSelectionControls();
      }
    }, false);

    for (let prop in localStorage) {
      if (!localStorage.hasOwnProperty(prop)) continue;
      let link = document.createElement("a"),
      select = document.createElement("button"),
      name = document.createElement("span"),
      value = document.createElement("span"),
      id = selects.length,
      obj = {
        wrapper: link,
        prop: prop,
        selected: false
      };

      select.className = "material-btn icon";
      select.addEventListener("click", e => {
        link.classList.toggle("selected");
        obj.selected = !obj.selected;
        if (allSelected()) selectAll.classList.add("checked");
        else selectAll.classList.remove("checked");
        updateSelectionControls();
        e.preventDefault();
      }, false);
      hasMaterialRipple(select, "light");

      link.href = "?prop=" + encodeURIComponent(prop);
      name.textContent = prop.replace(/\r?\n/g, "");
      value.textContent = localStorage[prop].replace(/\r?\n/g, "");

      link.appendChild(select);
      link.appendChild(name);
      link.appendChild(value);
      list.appendChild(link);
      selects.push(obj);
    }
  }
}, false);
