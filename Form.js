class Form {
    static init() {
        Form.container = document.getElementById("uiContainer");
    }

    static createFormUsingExistingID(id) {
        let div = document.createElement("div");
        div.className = "formPopup";
        let form = document.getElementById(id);
        form.className = "formContainer";

        return [div, form];
    }

    static addBrTo(parent) {
        parent.appendChild(document.createElement("br"));
    }

    static addTextNodeTo(parent, type, className = null, text) {
        let element = document.createElement(type);
        let textNode = document.createTextNode(text);
        element.appendChild(textNode);
        if(className != null)
            element.className = className;
        parent.append(element);
        return element;
    }

    static createLabel(htmlFor, innerHTML, header = false) {
        let label = document.createElement("label");
        if(header)
            label.className = "header";
        label.htmlFor = htmlFor;
        label.innerHTML = innerHTML;
        return label;
    }
    
    static createInputElement(type, name, value, extra = null) {
        var inp = document.createElement("input");
        inp.setAttribute("type", type);
        inp.setAttribute("name", name);
        if(value != null)
            inp.setAttribute("value", value);
        if(extra != null) {
            switch(type) {
                case "text":
                    inp.setAttribute("placeholder", extra);
                    break;
                case "checkbox":
                case "radio":
                    //if(extra != null) // adding this check because setting attribute to false checks the radio button for some reason
                    inp.setAttribute("checked", extra);
                    break;
            }
        }
        return inp;
    }
    
    static createButton(innerHTML, onClick, className = null) {
        let btn = document.createElement("button");
        if(className)
            btn.className = className;
        btn.innerHTML = innerHTML;
        btn.addEventListener("click", onClick);
        return btn;
    }
    
    static addTextInputTo(parent, name, formattedName) {
        parent.appendChild(Form.createLabel(name, formattedName, true))
        parent.appendChild(Form.createInputElement("text", name, null, "Enter " + formattedName));
        Form.addBrTo(parent);
    }
    
    static addListInputTo(parent, type, content, name, formattedName, defaultIndicies = []) {
        parent.appendChild(Form.createLabel(name, formattedName, true));
        Form.addBrTo(parent);
        for(let i = 0; i < content.length; i++) {
            let c = content[i];
            parent.appendChild(Form.createInputElement(type, name, i, defaultIndicies.includes(i) ? true : null));
            parent.appendChild(Form.createLabel(name, c));
        }
        Form.addBrTo(parent);
        Form.addBrTo(parent);
    }

    static addColourInputTo(parent, name, formattedName) {
        parent.appendChild(Form.createLabel(name, formattedName, true))
        Form.addBrTo(parent);
        parent.appendChild(Form.createInputElement("color", name, null));
        Form.addBrTo(parent);
        Form.addBrTo(parent);
    }

    static addDateInputTo(parent, name, formattedName) {
        parent.appendChild(Form.createLabel(name, formattedName, true))
        Form.addBrTo(parent);
        parent.appendChild(Form.createInputElement("date", name, null));
        Form.addBrTo(parent);
        Form.addBrTo(parent);
    }

    static shiftToLeftmostPos(uiStaticClass) {
        uiStaticClass.div.remove();
        Form.container.insertBefore(uiStaticClass.div, Form.container.firstChild);
    }
}