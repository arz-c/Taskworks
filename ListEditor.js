class ListEditor {
    static init() {
        // Creating form
        let [div, form] = Form.createFormUsingExistingID("listEditorForm");

        ListEditor.div = div;
        ListEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Edit List";
        form.appendChild(header);
        
        // Title
        Form.addTextInputTo(form, "title", "Title");
        
        // Buttons
        form.appendChild(Form.createButton("Save", ListEditor.save, "submit"));
        form.appendChild(Form.createButton("Cancel", ListEditor.closeWindow, "submit cancel"));
        form.appendChild(Form.createButton("Delete", ListEditor.deleteList, "submit"));
    
        // Heirarchy
        div.appendChild(form);
        Form.container.appendChild(div);
    }

    static save() {
        let formData = {};
        for(let c of ListEditor.form.children) {
            if(c.tagName == "INPUT")
                switch(c.name) {
                    case "title":
                        formData.title = c.value;
                        break;
                }
        }
        ListEditor.editingList.updateInfo(formData);
        ListEditor.editingList.updateTable();
        ListEditor.closeWindow();
    }

    static openWindow(list) {
        Form.shiftToLeftmostPos(ListEditor);
        ListEditor.div.style.display = "block";
        ListEditor.editingList = list;
        for(let c of ListEditor.form.children) {
            if(c.tagName == "INPUT") {
                switch(c.name) {
                    case "title":
                        c.value = list.title;
                        break;
                }
            }
        }
    }

    static closeWindow() {
        ListEditor.div.style.display = "none";
    }

    static deleteList() {
        ListEditor.editingList.delete();
        ListEditor.closeWindow();
    }
}