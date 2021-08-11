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
        Form.addSpacedInputTo(form, "text", "title", "Title", false);

        // Colour Editor
        Form.addSpacedInputTo(form, "color", "colour", "Colour", false);
        
        // Buttons
        form.appendChild(Form.createButton("Save", LabelEditor.save, "submit"));
        form.appendChild(Form.createButton("Cancel", LabelEditor.closeWindow, "submit secondary"));
        form.appendChild(Form.createButton("Delete", LabelEditor.deleteLabel, "submit"));
    
        // Heirarchy
        div.appendChild(form);
        Form.container.appendChild(div);
    }

    static openWindow(label) {
        Form.shiftToLeftmostPos(LabelEditor);
        LabelEditor.div.style.display = "block";
        LabelEditor.selectedLabel = label;

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
        LabelEditor.selectedLabel.updateInfo(formData);
        updateLabelsEverywhere();
        LabelEditor.closeWindow();
    }

    static closeWindow() {
        LabelEditor.div.style.display = "none";
    }

    static deleteLabel() {
        if(!confirm("Do you want to permanently delete this label?")) return;
        LabelEditor.selectedLabel.delete();
        LabelEditor.closeWindow();
    }
}