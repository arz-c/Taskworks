// Even though lists aren't visible to the user in Calendar View, this class is still needed for compatability with List View & the database
class List {
    constructor(data = {}) {
        this.title = data.title || "New list";
        this.tasks = [];
        if(data.tasks != undefined) {
            for(let i = 0; i < data.tasks.length; i++) {
                this.addTask(new Task(data.tasks[i])); 
            }
        }
    }

    addTask(task) {
        task.list = this;
        //let newIndex = this._insertTaskToCorrectPos(task); // add task to correct position in this.tasks*/
        this.tasks.push(task);
    }
}