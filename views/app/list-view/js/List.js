class List {
    constructor(data = {}) {
        this.title = data.title || "New list";
        this.checked = (data.checked != undefined) ? data.checked == "true" : false;
        this.tasks = []; // if tasks were in the "data" parameter, they are added to this list at the bottom of the constructor (so the HTML table is ready for tasks to be added to)

        // TABLE
        this.elements = []; // this will only be in "data" when fetched from database
        // Creating the list table
        let table = document.createElement("table");
        table.className = "list";
        this.elements.table = table
        
        // Creating the title text (in the form of a button)
        let thead = table.createTHead();
        let titleButton = Form.createButton(this.title, function() {
            ListEditor.openWindow(this)
        }.bind(this), "title");
        thead.appendChild(titleButton);
        this.elements.titleButton = titleButton;

        // Creating the "Create new task" button
        const _newTaskBtnOnclick = function() {
            let newTask = new Task();
            TaskEditor.openWindow(newTask)
            this.addTask(newTask);
            pushToDB("lists", "edit", {index: allLists.indexOf(this), object: this.objectify()}); // since list holds task data, updating list in database
        }

        let newTaskBtn = Form.createButton("Create new task", _newTaskBtnOnclick.bind(this));
        let newTaskRow = table.insertRow();
        newTaskRow.className = "newTaskRow";
        let newTaskTd = document.createElement("td");

        newTaskTd.appendChild(newTaskBtn)
        newTaskRow.appendChild(newTaskTd)
        table.appendChild(newTaskRow);

        // Creating the "Show checked" button & table
        const _showCheckedBtnOnclick = function() {
            if(this.innerHTML == "Hide checked") {
                this.checkedTable.style = "display: hidden";
                this.innerHTML = "Show checked";
            } else {
                this.checkedTable.style = "display: initial";  
                this.innerHTML = "Hide checked";
            }
        }

        let checkedTable = document.createElement("table");
        let showCheckedBtn = Form.createButton("Show checked", _showCheckedBtnOnclick);
        let showCheckedRow = table.insertRow();
        showCheckedRow.className = "showCheckedRow";
        let showCheckedTd = document.createElement("td");
        showCheckedBtn.checkedTable = checkedTable;
        checkedTable.className = "checkedTable";

        this.elements.checkedTable = checkedTable;
        showCheckedTd.appendChild(showCheckedBtn);
        showCheckedRow.appendChild(showCheckedTd);
        table.appendChild(checkedTable);

        // Inserting table before new list button
        document.body.insertBefore(table, document.getElementById("listConfigDiv")); // insert to rightmost pos

        if(this.checked) { // only want to show the table is not checked
            this.hideTable();
        }

        // if tasks were already in the database, create tasks using info provided by the DB and add them to this list
        if(data.tasks != undefined) {
            for(let i = 0; i < data.tasks.length; i++) {
                this.addTask(new Task(data.tasks[i])); 
            }
        }
    }

    objectify() {
        let tasks = [];
        for(let t of this.tasks) {
            tasks.push(t.objectify());
        }
        return {
            title: this.title,
            checked: this.checked,
            tasks: tasks
        }
    }

    updateInfo(data) {
        this.title = data.title;
        this.checked = data.checked;
        if(data.checked) this.hideTable();
        pushToDB("lists", "edit", {index: allLists.indexOf(this), object: this.objectify()});
    }

    showTable() {
        // moving HTML table
        let table = this.elements.table;
        table.remove(); // if it already exists, remove it first
        document.body.insertBefore(table, document.getElementById("listConfigDiv")); // insert to rightmost pos

        // moving list element in allLists
        //let oldI = allLists.indexOf(this);
        allLists.splice(allLists.indexOf(this), 1); // remove first
        allLists.push(this); // add to end
        //let newI = allLists.length - 1;

        // saving
        for(let i = 0; i < allLists.length; i++) {
            pushToDB("lists", "edit", {index: i, object: allLists[i]});  
        }
    }

    hideTable() {
        this.elements.table.remove();
    }

    _insertTaskToCorrectPos(task, exists = false) {
        let t;
        if(exists) // task does already exist in list
            t = this.tasks.splice(this.tasks.indexOf(task), 1)[0]; // remove task from array and save it to t
        else // task doesn't already exist in list
            t = task;

        let newIndex = -1;

        if(t.checked) { // if its checked
            this.tasks.push(t); // simply add to end of array
            newIndex = this.tasks.length - 1;
            return -1; // -1 indicates it is checked
        }
        
        let comparingDates = false;
        let len = this.tasks.length; // need this so for loop doesn't dynamically check for new lengths
        for(let i = 0 ; i < len; i++) {
            let curTask = this.tasks[i];
            // tasks array goes from highest to lowest priortity
            if(curTask.checked) { // if just made it to the checked task group at the bottom
                this.tasks.splice(i, 0, t); // insert elemenet in position
                newIndex = i;
                break;
            } else if(comparingDates && (numericDateToInt(t.due) < numericDateToInt(curTask.due) || t.priority > curTask.priority)) { // insert either in between same priority tasks or at the bottom of the priority group
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
        let newIndex = this._insertTaskToCorrectPos(task, true);
        // moving task table to new index
        let table = task.elements.table; // save the table
        table.parentElement.remove(); // remove the row holding the table
        task.elements.table.remove(); // remove the table
        if(newIndex == -1)
            this.elements.checkedTable.insertRow().appendChild(table); // add the table to a row at the bottom of the checked table
        else
            this.elements.table.insertRow(newIndex).appendChild(table); // add the table to a row created at the given index
    }

    addTask(task) {
        task.list = this;
        let newIndex = this._insertTaskToCorrectPos(task); // add task to correct position in this.tasks
        task.createTable( // add the table to a row created at its new index in this.tasks
            this.elements.table.insertRow(newIndex)
        );
    }

    removeTask(task) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
    }

    updateTable() {
        this.elements.titleButton.innerHTML = this.title; // update title
        updateLabelsEverywhere();
    }

    delete() {
        for(let i = this.tasks.length - 1; i >= 0; i--) // this is done backwards because elements are being dynamically removed from this.tasks
            this.tasks[i].delete();
        this.elements.table.remove();
        let allListsIndex = allLists.indexOf(this);
        pushToDB("lists", "remove", {index: allListsIndex});
        allLists.splice(allListsIndex, 1);
        delete this;
    }
}