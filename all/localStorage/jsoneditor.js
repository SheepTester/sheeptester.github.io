const types = ["remove", "string", "number", "boolean", "null", "object", "array"],
defaults = {string: "hello", number: 1, boolean: true, null: null, object: {}, array: []},
defaultType = "string";

class JSONEditor {

  constructor(obj, isTopLevel) {
    this.wrapper = document.createElement("span");
    this.wrapper.classList.add("json-editor");
    if (typeof obj === "object" && obj !== null) {
      this.wrapper.classList.add("object");
      if (Array.isArray(obj)) this.wrapper.classList.add("array");
      this.type = Array.isArray(obj) ? "array" : "object";

      if (!isTopLevel) {
        let button = document.createElement("button");
        button.classList.add("collapse");
        button.addEventListener("click", e => {
          this.wrapper.classList.toggle("collapsed");
        }, false);
        this.wrapper.appendChild(button);
      }

      this.wrapper.appendChild(document.createTextNode(Array.isArray(obj) ? "[" : "{"));

      let ellipsis = document.createElement("span");
      ellipsis.classList.add("ellipsis");
      ellipsis.appendChild(document.createTextNode("..."));
      this.wrapper.appendChild(ellipsis);

      this.itemElems = document.createElement("span");
      this.itemElems.classList.add("items");

      if (Array.isArray(obj)) {
        this.items = obj.map(i => this.newArrayItem(i));
      } else {
        this.items = {};
        for (let prop in obj) {
          this.newObjectProperty(prop, obj[prop]);
        }
      }
      this.wrapper.appendChild(this.itemElems);

      let addBtn = document.createElement("button");
      addBtn.classList.add("new");
      addBtn.appendChild(document.createTextNode("+"));
      addBtn.addEventListener("click", e => {
        if (this.type === "object") {
          let propName = "property",
          i = 1,
          propertyNames = Object.values(this.items).map(i => i.property.value);
          while (this.items.hasOwnProperty(propName) || propertyNames.includes(propName)) propName = `property #${++i}`;
          let item = this.newObjectProperty(propName, defaults[defaultType]);
          JSONEditor.fitInputToValue(item.property);
          item.value.updateInputWidths();
        } else if (this.type === "array") {
          let editor = this.newArrayItem(defaults[defaultType]);
          editor.updateInputWidths();
          this.items.push(editor);
        }
      }, false);
      this.wrapper.appendChild(addBtn);

      this.wrapper.appendChild(document.createTextNode(Array.isArray(obj) ? "]" : "}"));
    } else {
      this.content = document.createElement("input");
      this.content.addEventListener("input", e => {
        if (this.type === "string" || this.type === "number") JSONEditor.fitInputToValue(this.content);
      }, false);
      this.content.addEventListener("change", e => {
        if (this.type === "number") {
          this.content.value = +this.content.value;
          JSONEditor.fitInputToValue(this.content);
        }
      }, false);
      this.wrapper.appendChild(this.content);

      if (typeof obj === "object") this.setType("null");
      else this.setType(typeof obj, obj);
    }
    if (!isTopLevel) {
      this.typeSelect = document.createElement("select");
      types.map(t => {
        let opt = document.createElement("option");
        opt.appendChild(document.createTextNode(t));
        this.typeSelect.appendChild(opt);
      });
      this.typeSelect.value = this.type;
      this.typeSelect.addEventListener("change", e => {
        let newType = this.typeSelect.value,
        newIsObject = newType === "object" || newType === "array",
        currentlyIsObject = this.wrapper.classList.contains("object");
        if (this.type === newType) return;
        else if (newType === "remove") {
          this.parent.remove(this);
          return;
        }
        if (!currentlyIsObject && !newIsObject) {
          this.setType(newType, defaults[newType]);
        } else {
          this.parent.remove(this, newType);
        }
      }, false);
      this.wrapper.appendChild(this.typeSelect);
    }
  }

  setType(type, defaultValue) {
    this.wrapper.classList.remove(this.type);
    this.type = type;
    this.wrapper.classList.add(type);
    this.content.type = "text";
    switch (type) {
      case "string":
        this.content.value = defaultValue !== undefined ? defaultValue : "";
        JSONEditor.fitInputToValue(this.content);
        break;
      case "number":
        this.content.value = defaultValue !== undefined ? +defaultValue : 0;
        JSONEditor.fitInputToValue(this.content);
        break;
      case "boolean":
        this.content.type = "checkbox";
        this.content.checked = defaultValue !== undefined ? !!defaultValue : false;
        this.content.style.width = null;
        break;
    }
  }

  updateInputWidths() {
    if (this.type === "string" || this.type === "number") JSONEditor.fitInputToValue(this.content);
    else if (this.type === "object") {
      Object.keys(this.items).map(prop => {
        JSONEditor.fitInputToValue(this.items[prop].property);
        this.items[prop].value.updateInputWidths();
      });
    } else if (this.type === "array") {
      this.items.map(i => i.updateInputWidths());
    }
  }

  remove(item, replaceType) {
    let newElement;
    if (replaceType) {
      newElement = new JSONEditor(defaults[replaceType]);
      newElement.parent = this;
    }
    if (this.type === "object") {
      let prop;
      for (prop in this.items) if (this.items[prop].value === item) break;
      if (replaceType) {
        this.items[prop].wrapper.removeChild(this.items[prop].value.wrapper);
        this.items[prop].value = newElement;
        this.items[prop].wrapper.appendChild(newElement.wrapper);
      } else {
        this.items[prop].wrapper.parentNode.removeChild(this.items[prop].wrapper);
        delete this.items[prop];
      }
    } else if (this.type === "array") {
      let index = this.items.indexOf(item),
      wrapper = this.items[index].wrapper.parentNode;
      if (replaceType) {
        wrapper.removeChild(this.items[index].wrapper);
        this.items[index] = newElement;
        wrapper.appendChild(newElement.wrapper);
      } else {
        wrapper.parentNode.removeChild(wrapper);
        this.items.splice(index, 1);
      }
    }
    if (replaceType) newElement.updateInputWidths();
  }

  newArrayItem(obj) {
    let item = document.createElement("span"),
    editor = new JSONEditor(obj);
    editor.parent = this;
    item.classList.add("item");
    item.appendChild(editor.wrapper);
    this.itemElems.appendChild(item);
    return editor;
  }

  newObjectProperty(prop, value) {
    let item = document.createElement("span"),
    propElem = document.createElement("input"),
    colon = document.createElement("span"),
    jsonEditor = new JSONEditor(value);
    item.classList.add("item");
    propElem.classList.add("property")
    propElem.value = prop;
    propElem.addEventListener("input", e => JSONEditor.fitInputToValue(propElem), false);
    colon.classList.add("colon");
    colon.textContent = ":";
    this.items[prop] = {
      property: propElem,
      value: jsonEditor,
      wrapper: item
    };
    this.items[prop].value.parent = this;
    item.appendChild(propElem);
    item.appendChild(colon);
    item.appendChild(this.items[prop].value.wrapper);
    this.itemElems.appendChild(item);
    return this.items[prop];
  }

  toObject() {
    switch (this.type) {
      case "null": return null;
      case "boolean": return this.content.checked;
      case "number": return +this.content.value;
      case "string": return this.content.value;
      case "array": return this.items.map(i => i.toObject());
      case "object":
        let obj = {};
        Object.values(this.items).map(i => obj[i.property.value] = i.value.toObject());
        return obj;
    }
  }

  toString() {
    return JSON.stringify(this.toObject());
  }

  static fitInputToValue(input) {
    input.style.width = Math.ceil(textSize(input.value, input).width) + "px";
  }

}
