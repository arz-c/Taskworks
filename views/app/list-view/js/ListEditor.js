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
        Form.addSpacedInputTo(form, "text", "title", "Title");
        
        // Buttons
        form.appendChild(Form.createButton("Save", ListEditor.save, "submit"));
        form.appendChild(Form.createButton("Cancel", ListEditor.closeWindow, "submit secondary"));
        /*Form.addHrTo(form);
        form.appendChild(Form.createButton("Archive", ListEditor.archiveList, "submit"));*/
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
        ListEditor.selectedList.updateInfo(formData);
        ListEditor.selectedList.updateTable();
        ListEditor.closeWindow();
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
                }
            }
        }
    }

    static closeWindow() {
        ListEditor.div.style.display = "none";
    }

    static archiveList() {
        if(!confirm("Do you want to archive this list and all of its tasks?")) return;
        ListEditor.selectedList.archive();
        ListEditor.closeWindow();
    }

    static deleteList() {
        if(!confirm("Do you want to permanently delete this list and all of its tasks?")) return;
        ListEditor.selectedList.delete();
        ListEditor.closeWindow();
    }
}