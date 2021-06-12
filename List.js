class List {
    constructor(title, label) {
        this.title = title || "";
        this.tasks = [];
        this.label = label;

        // Creating the list table
        this.table = document.createElement("table");
        this.table.className = "list";
        this.table.style = "background-color: " + Label.arrToCSSColourString(allLabels[this.label].colour);
        
        // Creating the title text
        let thead = this.table.createTHead();
        addTextToParent(thead, "th", null, this.title);
        
        // makes title's colour = label's colour, and contrasts the background with it
        /*titleTH.style =
            "background-color: " + Label.arrToCSSColourString(hueInvert(this.label.colour)) +
            "; color: " + Label.arrToCSSColourString(this.label.colour);*/
        
        // Moving new list button
        let newListButton = document.getElementById("newListButton")
        document.body.insertBefore(this.table, newListButton);

        // Creating the "Create new task" button
        let newTaskButton = document.createElement("button");
        newTaskButton.innerHTML = "Create new task";
        newTaskButton.onclick = this.newTaskButtonOnclick;
        // Storing "this" list because the "this" keyword in the onclick handler refers to the button HTML element instead of this list
        newTaskButton.list = this;
        let buttonRow = this.table.insertRow();
        buttonRow.className = "newTaskRow"
        let td = document.createElement("td");
        td.appendChild(newTaskButton)
        buttonRow.appendChild(td)
        this.table.appendChild(buttonRow);
    }

    addTask(task) {
        this.tasks.push(task);
        if(task.labels != null) {
            let mainLabelI = task.labels.indexOf(this.label);
            switch(mainLabelI == -1) {
                case false:
                    task.labels.splice(mainLabelI, 1) // remove it
                case true:
                    task.labels.unshift(this.label) // add to start
                    break;
            }
        }
        task.createOrUpdateTable(
            this.table.insertRow(
                this.tasks.length - 1
            )
        );
    }

    newTaskButtonOnclick() {
        let newTask = new Task({labels: [this.list.label]});
        TaskEditor.openWindow(newTask)
        this.list.addTask(newTask);
    }
}