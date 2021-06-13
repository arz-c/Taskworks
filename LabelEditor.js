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
        Form.addTextInputElements(form, "title", "Title");
        
        // Buttons
        form.appendChild(Form.createSubmitButtonElement("Save", LabelEditor.save));
        form.appendChild(Form.createSubmitButtonElement("Cancel", LabelEditor.closeWindow, "cancel"));
        form.appendChild(Form.createSubmitButtonElement("Delete", LabelEditor.deleteLabel));
    
        // Heirarchy
        div.appendChild(form);
        container.appendChild(div);
    }

    static save() {

    }

    static openWindow(label) {
        LabelEditor.div.style.display = "block";
        LabelEditor.editingLabel = label;
    }

    static closeWindow() {
        LabelEditor.div.style.display = "none";
    }

    static deleteLabel() {

    }
}