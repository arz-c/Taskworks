class Form {
    static createFormUsingExistingID(id) {
        let container = document.getElementById("uiContainer");
        let div = document.createElement("div");
        div.className = "formPopup";
        let form = document.getElementById(id);
        form.className = "formContainer";

        return [container, div, form];
    }

    static createLabelElement(htmlFor, innerHTML, header = false) {
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
        inp.setAttribute("value", value);
        if(extra != null) {
            switch(type) {
                case "text":
                    inp.setAttribute("placeholder", extra);
                    break;
                case "checkbox":
                case "radio":
                    if(extra != null) // adding this check because setting attribute to false checks the radio button for some reason
                        inp.setAttribute("checked", extra);
                    break;
            }
        }
        return inp;
    }
    
    static createSubmitButtonElement(innerHTML, onClick, className = null) {
        let submitBtn = document.createElement("button");
        if(className)
            submitBtn.className = className;
        submitBtn.innerHTML = innerHTML;
        submitBtn.addEventListener("click", onClick);
        return submitBtn;
    }
    
    static addTextInputElements(form, name, formattedName) {
        form.appendChild(Form.createLabelElement(name, formattedName, true))
        form.appendChild(Form.createInputElement("text", name, "", "Enter " + formattedName));
    }
    
    static addListInputElements(form, type, content, name, formattedName, defaultIndicies = []) {
        form.appendChild(Form.createLabelElement(name, formattedName, true));
        form.appendChild(document.createElement("br"));
        for(let i = 0; i < content.length; i++) {
            let c = content[i];
            form.appendChild(Form.createInputElement(type, name, i, defaultIndicies.includes(i) ? true : null));
            form.appendChild(Form.createLabelElement(name, c));
        }
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));
    }
}