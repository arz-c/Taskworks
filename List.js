class List {
    constructor(title) {
        this.title = title || "New list";
        this.tasks = [];

        // TABLE
        this.elements = [];

        // Creating the list table
        let table = document.createElement("table");
        table.className = "list";
        this.elements.table = table
        
        // Creating the title text (in the form of a button)
        let thead = table.createTHead();
        let titleButton = Form.createButton(this.title, function() {
            ListEditor.openWindow(this.list)
        }, "title");
        // Storing "this" list because the "this" keyword in the onclick handler refers to the button HTML element instead of this list
        titleButton.list = this;
        thead.appendChild(titleButton);
        this.elements.titleButton = titleButton;
        
        // Moving new list button
        let newListButton = document.getElementById("newListButton")
        document.body.insertBefore(table, newListButton);

        // Creating the "Create new task" button
        let newTaskButton = Form.createButton("Create new task", this.newTaskButtonOnclick);
        // Storing "this" list because the "this" keyword in the onclick handler refers to the button HTML element instead of this list
        newTaskButton.list = this;
        let buttonRow = table.insertRow();
        buttonRow.className = "newTaskRow"
        let td = document.createElement("td");
        td.appendChild(newTaskButton)
        buttonRow.appendChild(td)
        table.appendChild(buttonRow);
    }

    _reorderTaskArray(task, exists = false) {
        let t;
        if(exists) // task does already exist in list
            t = this.tasks.splice(this.tasks.indexOf(task), 1)[0]; // remove task from array and save it to t
        else // task doesn't already exist in list
            t = task;

        let comparingDates = false;
        let newIndex = -1;
        let len = this.tasks.length; // need this so for loop doesn't dynamically check for new lengths
        for(let i = 0 ; i < len; i++) {
            let curTask = this.tasks[i];
            // tasks array goes from highest to lowest priortity
            if(comparingDates && (numericDateToInt(t.due) < numericDateToInt(curTask.due) || t.priority > curTask.priority)) { // insert either in between same priority tasks or at the bottom of the priority group
                this.tasks.splice(i, 0, t); // insert elemenet in position
                newIndex = i;
                break;
            } else if(t.priority > curTask.priority) {
                this.tasks.splice(i, 0, t); // insert elemenet in position
                newIndex = i;
                break;
            } else if(t.priority == curTask.priority) { // if in the same priority group (=)/just made it past same priority group (>)
                if(numericDateToInt(t.due) < numericDateToInt(curTask.due)) { // if new task is due before cur task
                    this.tasks.splice(i, 0, t); // insert elemenet in position
                    newIndex = i;
                    break;
                } else {
                    comparingDates = true; // now that new tasks' priority must match or be less than cur task, set this to true
                }
            }
        }

        if(newIndex == -1) { // if no spot was found
            this.tasks.push(task) // add it to the end
            newIndex = this.tasks.length - 1;
        }

        return newIndex;
    }

    updateTaskPosition(task) {
        let newIndex = this._reorderTaskArray(task, true);
        // moving task table to new index
        let table = task.elements.table; // save the table
        task.elements.table.remove(); // remove the table
        this.elements.table.insertRow(newIndex).appendChild(table); // add the table to a row created at the given index
    }

    addTask(task) {
        task.list = this;
        let newIndex = this._reorderTaskArray(task); // add task to correct position in this.tasks
        task.createOrUpdateTable( // add the table to a row created at its new index in this.tasks
            this.elements.table.insertRow(newIndex)
        );
    }

    removeTask(task) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
    }

    newTaskButtonOnclick() {
        let newTask = new Task();
        TaskEditor.openWindow(newTask)
        this.list.addTask(newTask);
    }

    updateInfo(data) {
        this.title = data.title;
    }

    updateTable() {
        this.elements.titleButton.innerHTML = this.title; // update title
        updateLabelsEverywhere();
    }

    delete() {
        allLists.splice(allLists.indexOf(this), 1);
        this.elements.table.remove();
        delete this;
    }
}