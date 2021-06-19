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

        /*// Label Colour Editor
        Form.addColourInputElement(form, "labelColour", "Label Colour");*/
        
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
                    /*case "labelColour":
                        formData.colour = Label.hexToArr(c.value);
                        break;*/
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
        /*for(let i = 0; i < TaskEditor.form.children.length; i++) { // why doesnt this work?
            let c = TaskEditor.form.children[i];
            if(c.tagName == "INPUT" && c.name == "title") {
                //if(list.title != null)
                TaskEditor.form.children[i].value = "test";
                TaskEditor.form.children[i].setAttribute("value", "test");
                console.log(c);
                break;
            }
        }*/
        for(let c of ListEditor.form.children) {
            if(c.tagName == "INPUT") {
                switch(c.name) {
                    case "title":
                        c.value = list.title;
                        break;
                    /*case "labelColour":
                        c.value = Label.arrToHex(allLabels[list.labelIndex].colour);
                        break;*/
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