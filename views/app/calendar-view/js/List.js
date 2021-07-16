// Even though lists aren't visible to the user in Calendar View, this class is still needed for compatability with List View & the database
class List {
    constructor(data = {}) {
        this.title = data.title || "New list";
        this.tasks = []; // if tasks were in the "data" parameter, they are added to this list at the bottom of the constructor (so the HTML table is ready for tasks to be added to)
        if(data.tasks != undefined) {
            for(let i = 0; i < data.tasks.length; i++) {
                this.addTask(new Task(data.tasks[i])); 
            }
        }
    }

    objectify() {
        return {
            title: this.title,
            tasks: this.tasks,
        }
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
            return newIndex;
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
        this._insertTaskToCorrectPos(task, true); // only updating position in this.tasks since list table isn't visible in this view
    }

    addTask(task) {
        task.list = this;
        let newIndex = this._insertTaskToCorrectPos(task); // add task to correct position in this.tasks
    }

    removeTask(task) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
    }

    updateInfo(data) {
        this.title = data.title;
        pushToDB("lists", "edit", {index: allLists.indexOf(this), object: this.objectify()});
    }

    archive() {
        for(let i = this.tasks.length - 1; i >= 0; i--) // this is done backwards because elements are being dynamically removed from this.tasks
            this.tasks[i].archive();
        this.elements.table.remove();
        archivedLists.push(this);
        let allListsIndex = allLists.indexOf(this);
        pushToDB("archivedLists", "add", {object: this.objectify()});
        pushToDB("lists", "remove", {index: allListsIndex});
        allLists.splice(allListsIndex, 1);
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