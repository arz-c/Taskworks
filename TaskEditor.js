class TaskEditor {
     static _createLabelElement(htmlFor, innerHTML, doBold = false) {
        let label = document.createElement("label");
        let elem = label;
        if(doBold) {
            let boldText = document.createElement("b");
            label.appendChild(boldText);
            elem = boldText;
        }
        
        elem.htmlFor = htmlFor;
        elem.innerHTML = innerHTML;
        return elem;
    }
    
    static _createInputElement(type, name, value, extra = null) {
        var inp = document.createElement("input");
        inp.setAttribute("type", type);
        inp.setAttribute("name", name);
        inp.setAttribute("value", value);
        if(extra != null) {
            switch(type) {
                case "text":
                    inp.setAttribute("placeholder", extra);
                    break;
                case "checkbox":
                case "radio":
                    if(extra != null) // adding this check because setting attribute to false checks the radio button for some reason
                        inp.setAttribute("checked", extra);
                    break;
            }
        }
        return inp;
    }
    
    static _createSubmitButtonElement(className, innerHTML, onClick = null) {
        let submitBtn = document.createElement("button");
        submitBtn.className = className;
        submitBtn.innerHTML = innerHTML;
        if(onClick)
            submitBtn.addEventListener("click", onClick);
        return submitBtn;
    }
    
    static _addTextInputElements(form, name, value, formattedName) {
        form.appendChild(TaskEditor._createLabelElement(name, formattedName, true))
        form.appendChild(TaskEditor._createInputElement("text", name, value, "Enter " + formattedName));
    }
    
    static _addListInputElements(form, type, content, name, formattedName, defaultIndicies = []) {
        form.appendChild(TaskEditor._createLabelElement(name, formattedName, true));
        form.appendChild(document.createElement("br"));
        for(let i = 0; i < content.length; i++) {
            let c = content[i];
            form.appendChild(TaskEditor._createInputElement(type, name, i, defaultIndicies.includes(i) ? true : null));
            form.appendChild(TaskEditor._createLabelElement(name, c));
        }
        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));
    }

    static _addLabelInputElements(form, type, content, name, formattedName, defaultIndex = []) {
        let toAppend = false;
        let div = document.getElementById("labelsDiv");
        if(div == null) {
            div = document.createElement("div");
            div.id = "labelsDiv";
            toAppend = true;
        }
        TaskEditor._addListInputElements(div, type, content, name, formattedName, defaultIndex);
        if(toAppend)
            form.appendChild(div);
    }
    
    static init() {
        // Creating form
        let div = document.createElement("div");
        div.className = "form-popup";
        div.id = "editTaskForm";
        let form = document.getElementById("taskEditorForm");
        form.className = "form-container";
        
        TaskEditor.div = div;
        TaskEditor.form = form;
        
        // Form Header
        let header = document.createElement("h1")
        header.innerHTML = "Edit Task";
        form.appendChild(header);
        
        // Title
        TaskEditor._addTextInputElements(form, "title", "", "Title");
    
        // Labels (checkboxes)
        TaskEditor._addLabelInputElements(form, "checkbox", getAllLabelsStrArray(), "labels", "Labels");

        // Doing Dates
        TaskEditor._addTextInputElements(form, "doingStart", "", "Start Doing Date");
        TaskEditor._addTextInputElements(form, "doingEnd", "", "End Doing Date");

        // Due Date
        TaskEditor._addTextInputElements(form, "due", "", "Due Date");
    
        // DOTW (checkboxes)
        TaskEditor._addListInputElements(form, "checkbox", DAY_STRINGS, "dotw", "Days of the Week", [0, 1, 2, 3, 4, 5, 6]);
    
        // Priority (radio button)
        TaskEditor._addListInputElements(form, "radio", ["Low", "Medium", "High"], "priority", "Priority", [0]);
    
        form.appendChild(TaskEditor._createSubmitButtonElement("btn", "Submit", TaskEditor.save));
        form.appendChild(TaskEditor._createSubmitButtonElement("btn cancel", "Cancel", TaskEditor.closeWindow));
    
        div.appendChild(form);
        document.body.appendChild(div);
    }

    static updateLabels() {
        document.getElementById("labelsDiv").innerHTML = '' // clear all children;
        TaskEditor._addLabelInputElements(TaskEditor.form, "checkbox", getAllLabelsStrArray(), "labels", "Labels");
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
                        if(task.dotw == null)
                            continue;
                        c.checked = task.dotw[dotwI];
                        dotwI++;
                        break;
                    case "priority":
                        if(task.priority == null)
                            continue;
                        if(task.priority == prioI)
                            c.checked = true;
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
        //console.log(formData);
        TaskEditor.editingTask.updateInfo(formData);
        TaskEditor.editingTask.createOrUpdateTable();
        TaskEditor.closeWindow();
    }
}