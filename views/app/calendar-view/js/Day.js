class Day {
    constructor(parent, year, month, day, isFiller) {
        this.id = `${year} ${month} ${day}`
        this.tasks = [];

        // TABLE
        this.elements = [];

        // Creating the day table
        let table = document.createElement("table");
        table.className = "day";
        if(isFiller) table.className += " filler";
        this.elements.table = table
        
        // Creating the title text (in the form of a button)
        let thead = table.createTHead();
        let title = Form.createTextElement("h1", day + 1);
        thead.appendChild(title);
        this.elements.title = title;

        parent.appendChild(table);
    }

    _insertTaskToCorrectPos(task, exists = false) { // exists is so if a task already exists in this.tasks, move it instead of duplicating it
        let t;
        if(exists) // task does already exist in list
            t = this.tasks.splice(this.tasks.indexOf(task), 1)[0]; // remove task from array and save it to t
        else // task doesn't already exist in list
            t = task;

        if(t.checked) { // if its checked
            this.tasks.push(t); // simply add to end of array
            return this.tasks.length - 1;
        }
        
        let comparingDates = false;
        let len = this.tasks.length; // need this so for loop doesn't dynamically check for new lengths
        for(let i = 0 ; i < len; i++) {
            let curTask = this.tasks[i];
            let due;
            if(!t.optionals.due) // due is an optional property
                due = t.doingStart;
            else
                due = t.due;
            // tasks array goes from highest to lowest priortity
            if(t.checkedByDay[this.id]) { // if this task is checked by day, ignore everything else and
                if(curTask.checked) { // look for the checked by list section
                    this.tasks.splice(i, 0, t); // insert element before it as soon as it is found
                    return i;
                }
            } else if(curTask.checked || curTask.checkedByDay[this.id]) { // if just made it to the checked task group at the bottom
                this.tasks.splice(i, 0, t); // insert element in position
                return i;
            } else if(comparingDates && (numericDateToInt(due) < numericDateToInt(curTask.due) || t.priority > curTask.priority)) { // insert either in between same priority tasks or at the bottom of the priority group
                this.tasks.splice(i, 0, t); // insert element in position
                return i;
            } else if(t.priority > curTask.priority) {
                this.tasks.splice(i, 0, t); // insert element in position
                return i;
            } else if(t.priority == curTask.priority) { // if in the same priority group (=)/just made it past same priority group (>)
                if(numericDateToInt(due) < numericDateToInt(curTask.due)) { // if new task is due before cur task
                    this.tasks.splice(i, 0, t); // insert element in position
                    return i;
                } else {
                    comparingDates = true; // now that new tasks' priority must match or be less than cur task, set this to true
                }
            }
        }

        // if no spot was found
        this.tasks.push(task) // add it to the end
        return this.tasks.length - 1;
    }

    setToToday() {
        this.elements.table.className += " today";
    }

    removeAsToday() {
        this.elements.table.className = this.elements.table.className.replace(" today", "");
    }

    setToOverdue() {
        this.elements.table.className += " overdue";
    }

    updateTaskPosition(task) {
        let newIndex = this._insertTaskToCorrectPos(task, true);
        // moving task table to new index
        let table = task.elements[this.id].table; // save the table
        table.parentElement.remove(); // remove the row holding the table
        table.remove(); // remove the table
        this.elements.table.insertRow(newIndex).appendChild(table); // add the table to a row created at the given index
    }

    addTask(task) {
        task.days[this.id] = this;
        let newIndex = this._insertTaskToCorrectPos(task); // add task to correct position in this.tasks
        task.createTable( // add the table to a row created at its new index in this.tasks
            this.elements.table.insertRow(newIndex),
            this.id
        );
    }

    removeTask(task) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
    }

    delete() {
        delete this;
    }
}