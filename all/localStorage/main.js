let urlParams = {};
if (window.location.search) {
  let params = window.location.search.slice(1).split("&");
  for (let i = params.length; i--;) {
    let equalPos = params[i].indexOf("=");
    if (~equalPos) {
      urlParams[params[i].slice(0, equalPos)] = decodeURIComponent(params[i].slice(equalPos + 1));
    } else {
      urlParams[params[i]] = null;
    }
  }
}
function textSize(text, fontStyle) {
  let dummyText = document.createElement("span"),
  width;
  dummyText.classList.add("text-width");
  if (typeof fontStyle === "string") dummyText.style.font = font;
  else dummyText.style.font = document.defaultView.getComputedStyle(fontStyle).font;
  dummyText.appendChild(document.createTextNode(text));
  document.body.appendChild(dummyText);
  width = {
    width: dummyText.getBoundingClientRect().width,
    height: dummyText.getBoundingClientRect().height
  };
  document.body.removeChild(dummyText);
  return width;
}
function looksLikeJSON(string) {
  return false; // TEMP
  try {
    return typeof JSON.parse(string) === "object" ? true : false;
  } catch (e) {
    return false;
  }
}
function editContent(e) {
  //
}
class EditableProperty {
  constructor() {
    this.elem = document.createElement("span");
    this.textarea = document.createElement("textarea");
    this.elem.addEventListener("click", e => {
      this.textarea.value = this.name;
      this.textarea.style.display = "block";
      this.updateTextareaSize();
      this.textarea.focus();
    }, false);
    this.textarea.addEventListener("blur", e => {
      this.textarea.style.display = "none";
      this.name = this.textarea.value;
    }, false);
    this.textarea.style.display = "none";
    this.name = "";
    this.elem.appendChild(textarea);
  }
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
    this.elem.textContent = JSON.stringify(name).slice(1, -1);
  }
  updateTextareaSize() {
    let box = textSize(this.textarea.value, this.textarea);
    this.textarea.style.width = box.width + "px";
    this.textarea.style.height = box.height + "px";
  }
}
class JSONEditor {
  constructor(obj) {
    this.wrapper = document.createElement("span");
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        //
      } else {
        //
      }
    } else {
      this.wrapper.textContent = obj;
      this.wrapper.addEventListener("click", editContent, false);
      switch (typeof obj) {
        case "string":
          this.wrapper.classList.add("string");
          break;
        case "number":
          this.wrapper.classList.add("number");
          break;
        case "boolean":
          this.wrapper.classList.add("boolean");
          break;
        case "object":
        case "undefined":
          this.wrapper.classList.add("null");
          break;
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", e => {
  if (urlParams.prop || urlParams.new) {
    const inputs = document.querySelectorAll(".input-wrapper input, .textarea-wrapper textarea");
    for (let i = inputs.length; i--;) {
      inputs[i].addEventListener("focus", e => {
        inputs[i].parentNode.classList.add("focus");
      }, false);
      inputs[i].addEventListener("blur", e => {
        inputs[i].parentNode.classList.remove("focus");
      }, false);
      inputs[i].addEventListener("change", e => {
        if (inputs[i].value) {
          inputs[i].parentNode.classList.add("filled");
        } else {
          inputs[i].parentNode.classList.remove("filled");
        }
      }, false);
      if (inputs[i].tagName === "TEXTAREA") {
        inputs[i].addEventListener("input", e => {
          valueInput.style.height = 0;
          inputs[i].style.height = inputs[i].scrollHeight + "px";
        }, false);
        window.addEventListener("resize", e => {
          valueInput.style.height = 0;
          inputs[i].style.height = inputs[i].scrollHeight + "px";
        }, false);
      }
    }

    const nameInput = document.querySelector("#name"),
    valueInput = document.querySelector("#value textarea"),
    saveBtn = document.querySelector("#save"),
    useJSONBtn = document.querySelector("#usejson"),
    JSONBtnTextNode = Array.from(useJSONBtn.childNodes).filter(a => a.nodeType === Node.TEXT_NODE)[0],
    jsonEditor = document.querySelector("#jsoneditor .editor");
    let usingJSON = false;
    function turnJSONMode(on) {
      usingJSON = on;
      if (on) {
        JSONBtnTextNode.textContent = "use plain text editor";
        document.body.classList.add("json-editor");
        while (jsonEditor.firstChild) jsonEditor.removeChild(jsonEditor.firstChild);
        let po = new JSONEditor(JSON.parse(valueInput.value));
        console.log(po);
        jsonEditor.appendChild(po.wrapper);
      } else {
        JSONBtnTextNode.textContent = "use JSON editor";
        document.body.classList.remove("json-editor");
      }
    }
    if (urlParams.prop && !urlParams.new) {
      nameInput.value = urlParams.prop;
      nameInput.parentNode.classList.add("filled");
      valueInput.value = localStorage.getItem(urlParams.prop) || "";
      if (valueInput.value) {
        valueInput.parentNode.classList.add("filled");
        valueInput.style.height = 0;
        valueInput.style.height = valueInput.scrollHeight + "px";
        function validateJSON() {
          if (looksLikeJSON(valueInput.value)) {
            useJSONBtn.disabled = false;
            return true;
          } else {
            useJSONBtn.disabled = true;
            return false;
          }
        }
        if (validateJSON()) {
          turnJSONMode(true);
        }
        valueInput.addEventListener("input", validateJSON, false);
      }
    }
    saveBtn.addEventListener("click", e => {
      localStorage.removeItem(urlParams.prop);
      localStorage.setItem(nameInput.value, valueInput.value);
      if (urlParams.prop !== nameInput.value) window.location.replace("?prop=" + encodeURIComponent(nameInput.value));
    }, false);
    useJSONBtn.addEventListener("click", e => {
      turnJSONMode(!usingJSON);
    }, false);
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
