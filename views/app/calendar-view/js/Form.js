class Form {
    static addBrTo(parent) {
        parent.appendChild(document.createElement("br"));
    }

    static addHrTo(parent) {
        parent.appendChild(document.createElement("hr"));
        Form.addBrTo(parent);
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

    static createTextElement(type, innerHTML) {
        let element = document.createElement(type);
        element.innerHTML = innerHTML;
        return element;
    }

    static createLabel(htmlFor, innerHTML, header = false) {
        let label = Form.createTextElement("label", innerHTML);
        if(header)
            label.className = "header";
        label.htmlFor = htmlFor;
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
        let btn = Form.createTextElement("button", innerHTML);
        if(className)
            btn.className = className;
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

    static addSpacedInputTo(parent, type, name, formattedName) {
        parent.appendChild(Form.createLabel(name, formattedName, true))
        Form.addBrTo(parent);
        parent.appendChild(Form.createInputElement(type, name, null));
        Form.addBrTo(parent);
        Form.addBrTo(parent);
    }
    
    static shiftToLeftmostPos(uiStaticClass) {
        uiStaticClass.div.remove();
        Form.container.insertBefore(uiStaticClass.div, Form.container.firstChild);
    }
}