class LabelEditor {
    static init() {
        // Creating form
        let [div, form] = Form.createFormUsingExistingID("labelEditorForm");

        LabelEditor.div = div;
        LabelEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Edit Label";
        form.appendChild(header);
        
        // Title
        Form.addSpacedInputTo(form, "text", "title", "Title");

        // Colour Editor
        Form.addSpacedInputTo(form, "color", "colour", "Colour");
        
        // Buttons
        form.appendChild(Form.createButton("Save", LabelEditor.save, "submit"));
        form.appendChild(Form.createButton("Cancel", LabelEditor.closeWindow, "submit secondary"));
        form.appendChild(Form.createButton("Delete", LabelEditor.deleteLabel, "submit"));
    
        // Heirarchy
        div.appendChild(form);
        Form.container.appendChild(div);
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