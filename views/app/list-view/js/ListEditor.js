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
        Form.addSpacedInputTo(form, "text", "title", "Title", false, true);

        // Checked
        Form.addSpacedInputTo(form, "checkbox", "checked", "Checked", false);
        
        // Buttons
        form.appendChild(Form.createButton("Save", ListEditor.save, "submit"));
        form.appendChild(Form.createButton("Cancel", ListEditor.closeWindow, "submit secondary"));
        form.appendChild(Form.createButton("Delete", ListEditor.deleteList, "submit"));
    
        // Heirarchy
        div.appendChild(form);
        Form.container.appendChild(div);
    }

    static openWindow(list) {
        Form.shiftToLeftmostPos(ListEditor);
        ListEditor.div.style.display = "block";
        ListEditor.selectedList = list;
        for(let c of ListEditor.form.children) {
            if(c.tagName == "INPUT") {
                switch(c.name) {
                    case "title":
                        c.value = list.title;
                        break;
                    case "checked":
                        c.checked = list.checked;
                        break;
                }
            }
        }
    }

    static save() {
        let formData = {};
        for(let c of ListEditor.form.children) {
            if(c.tagName == "INPUT")
                switch(c.name) {
                    case "title":
                        formData.title = c.value;
                        break;
                    case "checked":
                        formData.checked = c.checked;
                        break;  
                }
        }
        ListEditor.selectedList.updateInfo(formData);
        ListEditor.selectedList.updateTable();
        ListEditor.closeWindow();
    }

    static closeWindow() {
        ListEditor.div.style.display = "none";
    }

    static deleteList() {
        if(!confirm("Do you want to permanently delete this list and all of its tasks?")) return;
        ListEditor.selectedList.delete();
        ListEditor.closeWindow();
    }
}