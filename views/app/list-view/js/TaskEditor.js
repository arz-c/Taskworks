class TaskEditor {
    static init() {
        // Creating form
        let [div, form] = Form.createFormUsingExistingID("taskEditorForm");
        
        TaskEditor.div = div;
        TaskEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Edit Task";
        form.appendChild(header);
        
        // Title
        Form.addSpacedInputTo(form, "text", "title", "Title");
    
        // Labels (checkboxes)
        TaskEditor._addLabelInputTo(form, "checkbox", "labels", "Labels");

        // Doing Dates
        Form.addSpacedInputTo(form, "date", "doingStart", "Start Doing Date");
        Form.addSpacedInputTo(form, "date", "doingEnd", "End Doing Date");

        // Due Date
        Form.addSpacedInputTo(form, "date", "due", "Due Date");
    
        // DOTW (checkboxes)
        Form.addListInputTo(form, "checkbox", DAY_STRINGS, "dotw", "Days of the Week", [0, 1, 2, 3, 4, 5, 6]);
    
        // Priority (radio button)
        Form.addListInputTo(form, "radio", ["Low", "Medium", "High"], "priority", "Priority", [0]);

        // Active
        Form.addSpacedInputTo(form, "checkbox", "active", "Active");
    
        // Buttons
        form.appendChild(Form.createButton("Save", TaskEditor.save, "submit"));
        form.appendChild(Form.createButton("Cancel", TaskEditor.closeWindow, "submit secondary"));
        Form.addHrTo(form);
        form.appendChild(Form.createButton("Archive", TaskEditor.archiveTask, "submit"));
        form.appendChild(Form.createButton("Delete", TaskEditor.deleteTask, "submit secondary"));
        

        // Heirarchy
        div.appendChild(form);
        Form.container.appendChild(div);
    }

    // this label (tags at the top of tasks) is not to be confused with the HTML form element label
    static _addLabelInputTo(form, type, name, formattedName, defaultIndicies = []) {
        let toAppend = false;
        let div = document.getElementById("labelsDiv");
        if(div == null) {
            div = document.createElement("div");
            div.id = "labelsDiv";
            toAppend = true;
        }
        div.appendChild(Form.createLabel(name, formattedName, true));
        Form.addBrTo(div);
        for(let i = 0; i < allLabels.length; i++) {
            let l = allLabels[i];
            div.appendChild(Form.createInputElement(type, name, i, defaultIndicies.includes(i) ? true : null));
            div.appendChild(Form.createLabel(name, l.toString()));
            div.appendChild(Form.createButton("📜", function() {
                LabelEditor.openWindow(l);
            }, "editLabel"));
        }
        div.appendChild(Form.createButton("➕", function() {
            let label = new Label();
            allLabels.push(label);
            TaskEditor.updateLabels();
            LabelEditor.openWindow(label);
        }, "editLabel"));
        Form.addBrTo(div);
        Form.addBrTo(div);
        if(toAppend)
            form.appendChild(div);
    }


    static updateLabels() {
        let labevlsDiv = document.getElementById("labelsDiv");
        labevlsDiv.innerHTML = ""; // clear all children;
        TaskEditor._addLabelInputTo(TaskEditor.form, "checkbox", "labels", "Labels"); // add current labels
        if(TaskEditor.selectedTask != undefined) { // if the task editor window is currently open
            // then update checkmarks
            for(let l of labelsDiv.children) {
                if(l.tagName == "INPUT") {
                    l.checked = TaskEditor.selectedTask.labelIndices.indexOf(parseInt(l.value)) != -1;
                }
            }
        }
    }

    static openWindow(task) {
        Form.shiftToLeftmostPos(TaskEditor);
        TaskEditor.div.style.display = "block";
        TaskEditor.selectedTask = task;
        
        let dotwI = 0;
        let prioI = 0;
        for(let c of TaskEditor.form.children) {
            if(c.tagName == "INPUT") {
                if(c.name == "priority") {
                    if(task.priority == prioI) 
                            c.checked = true;
                        prioI++;
                } else if(c.name == "dotw") {
                    c.checked = task.dotw[dotwI];
                    dotwI++;
                } else {
                    if(c.type == "checkbox")
                        c.checked = task[c.name];
                    else
                        c.value = task[c.name];
                }
            } else if(c.id == "labelsDiv") { // label div
                for(let l of c.children) { // label
                    if(l.tagName == "INPUT") {
                        let searchVal = parseInt(l.value);
                        let found = false;
                        for(let infoL of task.labelIndices) {
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
                        case "text": // title
                        case "date": // all dates
                            formData[c.name] = "";
                            break;
                        case "checkbox": // active & dotw
                            if(c.name == "active")
                                formData["active"] = false;    
                            else if(c.name == "dotw")
                                formData["dotw"] = [];
                            break;
                        case "radio": // priority
                            formData[c.name] = -1;
                            break;
                    }
                }
                switch(c.type) {
                    case "text": // title
                        formData[c.name] = c.value;
                        break;
                    case "date": // all dates
                        formData[c.name] = c.value;
                        break;
                    case "checkbox": // dotw (not label)
                        if(c.name == "active")
                            formData["active"] = c.checked;
                        else if(c.name == "dotw")
                            formData["dotw"].push(c.checked);
                        break;
                    case "radio": // priority
                        if(c.checked)
                            formData[c.name] = parseInt(c.value);
                        break;
    
                }
            } else if(c.id == "labelsDiv") { // label div
                if(!("labelIndices" in formData)) // adding key to dict
                    formData["labelIndices"] = [];
                
                for(let l of c.children) { // label
                    if(l.tagName == "INPUT" && l.checked) {
                        formData["labelIndices"].push(parseInt(l.value));
                    }
                }
            }
        }
        TaskEditor.selectedTask.updateInfo(formData);
        TaskEditor.selectedTask.createOrUpdateTable();
        TaskEditor.closeWindow();
    }

    static archiveTask() {
        if(!confirm("Do you want to archive this task?")) return;
        TaskEditor.selectedTask.archive();
        TaskEditor.closeWindow();
    }

    static deleteTask() {
        if(!confirm("Do you want to permanently delete this task?")) return;
        TaskEditor.selectedTask.delete();
        TaskEditor.closeWindow();
    }
}