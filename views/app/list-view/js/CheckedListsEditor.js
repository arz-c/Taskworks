class CheckedListsEditor {
    static init() {
        // Creating form
        let [div, form] = Form.createFormUsingExistingID("checkedListsEditorForm");

        CheckedListsEditor.div = div;
        CheckedListsEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Checked Lists Editor";
        form.appendChild(header);
        
        // Title
        Form.addDropdownMenuTo(form, "selectedList", "Selected List", []);
        
        // Buttons
        form.appendChild(Form.createButton("Restore", CheckedListsEditor.restore, "submit"));
        form.appendChild(Form.createButton("Cancel", CheckedListsEditor.closeWindow, "submit secondary"));
    
        // Heirarchy
        div.appendChild(form);
        Form.container.appendChild(div);
    }

    static openWindow() {
        Form.shiftToLeftmostPos(CheckedListsEditor);
        CheckedListsEditor.div.style.display = "block";
        for(let c of CheckedListsEditor.form.children) {
            if(c.name == "selectedList") {
                c.innerHTML = "";
                for(let i = 0; i < allLists.length; i++) {
                    let list = allLists[i];
                    if(!list.checked) continue;
                    Form.addOptionToDropdownMenu(c, i, list.title, false);
                }
            }
        }
    }

    static restore() {
        for(let c of CheckedListsEditor.form.children) {
            if(c.name == "selectedList") {
                let list = allLists[parseInt(c.value)];
                list.showTable();
                list.updateInfo({title: list.title, checked: false});
                break;
            }
        }
        CheckedListsEditor.closeWindow();
    }

    static closeWindow() {
        CheckedListsEditor.div.style.display = "none";
    }
}