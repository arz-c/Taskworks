class TaskEditor {
    static _addLabelInputElements(form, type, content, name, formattedName, defaultIndex = []) {
        let toAppend = false;
        let div = document.getElementById("labelsDiv");
        if(div == null) {
            div = document.createElement("div");
            div.id = "labelsDiv";
            toAppend = true;
        }
        Form.addListInputElements(div, type, content, name, formattedName, defaultIndex);
        if(toAppend)
            form.appendChild(div);
    }

    static init() {
        // Creating form
        let [container, div, form] = Form.createFormUsingExistingID("taskEditorForm");
        
        TaskEditor.div = div;
        TaskEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Edit Task";
        form.appendChild(header);
        
        // Title
        Form.addTextInputElements(form, "title", "Title");
    
        // Labels (checkboxes)
        TaskEditor._addLabelInputElements(form, "checkbox", getAllLabelsStrArray(), "labels", "Labels");

        // Doing Dates
        Form.addTextInputElements(form, "doingStart", "Start Doing Date");
        Form.addTextInputElements(form, "doingEnd", "End Doing Date");

        // Due Date
        Form.addTextInputElements(form, "due", "Due Date");
    
        // DOTW (checkboxes)
        Form.addListInputElements(form, "checkbox", DAY_STRINGS, "dotw", "Days of the Week", [0, 1, 2, 3, 4, 5, 6]);
    
        // Priority (radio button)
        Form.addListInputElements(form, "radio", ["Low", "Medium", "High"], "priority", "Priority", [0]);
    
        // Buttons
        form.appendChild(Form.createSubmitButtonElement("Save", TaskEditor.save));
        form.appendChild(Form.createSubmitButtonElement("Cancel", TaskEditor.closeWindow, "cancel"));
        form.appendChild(Form.createSubmitButtonElement("Delete", TaskEditor.deleteTask));

        // Heirarchy
        div.appendChild(form);
        container.appendChild(div);
    }

    static updateLabels() {
        document.getElementById("labelsDiv").innerHTML = ""; // clear all children;
        TaskEditor._addLabelInputElements(TaskEditor.form, "checkbox", getAllLabelsStrArray(), "labels", "Labels"); // add current labels
    }

    static openWindow(task) {
        TaskEditor.div.style.display = "block";
        TaskEditor.editingTask = task;
        let dotwI = 0;
        let prioI = 0;
        for(let c of TaskEditor.form.children) {
            if(c.tagName == "INPUT") {
                switch(c.name) {
                    case "title":
                        if(task.title != null)
                            c.value = task.title;
                        else
                            c.value = "New task"
                        break;
                    case "doingStart":
                        if(task.doingStart != null)
                            c.value = task.doingStart;
                        else
                            c.value = getTodaysNumericDate();
                        break;
                    case "doingEnd":
                        if(task.doingEnd != null)
                            c.value = task.doingEnd;
                        else
                            c.value = getTodaysNumericDate();
                        break;
                    case "due":
                        if(task.due != null)
                            c.value = task.due;
                        else
                            c.value = getTodaysNumericDate();
                        break;
                    case "dotw":
                        if(task.dotw != null) {
                            c.checked = task.dotw[dotwI];
                            dotwI++;
                        } else
                            c.checked = true;
                        break;
                    case "priority":
                        if(task.priority != null) {
                            if(task.priority == prioI) 
                                c.checked = true;
                        } else {
                            if(prioI == 0)
                                c.checked = true;
                        }
                        prioI++;
                        break;
                }
            } else if(c.id == "labelsDiv") { // label div
                if(task.labels == null)
                    continue;
                for(let l of c.children) { // label
                    if(l.tagName == "INPUT") {
                        let searchVal = parseInt(l.value);
                        let found = false;
                        for(let infoL of task.labels) {
                            if(infoL == searchVal) {
                                found = true;
                                break;
                            }
                        }
                        l.checked = found;
                    }
                }
            }
        }
    }

    static closeWindow() {
        TaskEditor.div.style.display = "none";
    }

    static save() {
        let formData = {};
        for(let c of TaskEditor.form.children) {
            if(c.tagName == "INPUT") {
                if(!(c.name in formData)) { // adding key to dict
                    switch(c.type) {
                        case "text": // all text
                            formData[c.name] = "";
                            break;
                        case "checkbox": // dotw (not label)
                            formData[c.name] = [];
                            break;
                        case "radio": // priority
                            formData[c.name] = -1;
                            break;
                    }
                }
                switch(c.type) {
                    case "text": // all text
                        formData[c.name] = c.value;
                        break;
                    case "checkbox": // dotw (not label)
                        formData["dotw"].push(c.checked);
                        break;
                    case "radio": // priority
                        if(c.checked)
                            formData[c.name] = parseInt(c.value);
                        break;
    
                }
            } else if(c.id == "labelsDiv") { // label div
                if(!("labels" in formData)) // adding key to dict
                    formData["labels"] = [];
                
                let mainTask = TaskEditor.editingTask.labels[0];
                formData["labels"].push(mainTask);
                
                for(let l of c.children) { // label
                    if(l.tagName == "INPUT" && l.checked) {
                        if(l.value == mainTask)
                            continue;
                        formData["labels"].push(parseInt(l.value));
                    }
                }
            }
        }
        TaskEditor.editingTask.updateInfo(formData);
        TaskEditor.editingTask.createOrUpdateTable();
        TaskEditor.closeWindow();
    }

    static deleteTask() {
        TaskEditor.editingTask.delete();
        TaskEditor.closeWindow();
    }
}