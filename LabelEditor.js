class LabelEditor {
    static init() {
        // Creating form
        let [container, div, form] = Form.createFormUsingExistingID("labelEditorForm");

        LabelEditor.div = div;
        LabelEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Edit Label";
        form.appendChild(header);
        
        // Title
        Form.addTextInputElement(form, "title", "Title");

        // Colour Editor
        Form.addColourInputElement(form, "colour", "Colour");
        
        // Buttons
        form.appendChild(Form.createButtonElement("Save", LabelEditor.save, "submit"));
        form.appendChild(Form.createButtonElement("Cancel", LabelEditor.closeWindow, "submit cancel"));
        form.appendChild(Form.createButtonElement("Delete", LabelEditor.deleteLabel, "submit"));
    
        // Heirarchy
        div.appendChild(form);
        container.appendChild(div);
    }

    static save() {
        let formData = {};
        for(let c of LabelEditor.form.children) {
            if(c.tagName == "INPUT")
                switch(c.name) {
                    case "title":
                        formData.title = c.value;
                        break;
                    case "colour":
                        formData.colour = Label.hexToArr(c.value);
                        break;
                }
        }
        LabelEditor.editingLabel.updateInfo(formData);
        updateLabelsEverywhere();
        LabelEditor.closeWindow();
    }

    static openWindow(label) {
        Form.shiftToLeftmostPos(LabelEditor);
        LabelEditor.div.style.display = "block";
        LabelEditor.editingLabel = label;

        for(let c of LabelEditor.form.children) {
            if(c.tagName == "INPUT") {
                switch(c.name) {
                    case "title":
                        c.value = label.title;
                        break;
                    case "colour":
                        c.value = Label.arrToHex(label.colour);
                        break;
                }
            }
        }
    }

    static closeWindow() {
        LabelEditor.div.style.display = "none";
    }

    static deleteLabel() {
        LabelEditor.editingLabel.delete();
        LabelEditor.closeWindow();
    }
}