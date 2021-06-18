class List {
    constructor(title/*, labelIndex*/) {
        this.title = title || "New list";
        /*if(labelIndex != undefined) {
            this.labelIndex = labelIndex;
        } else {
            allLabels.push(new Label(this.title, [150, 150, 150]))
            this.labelIndex = allLabels.length - 1;
            TaskEditor.updateLabels();
        }*/

        this.tasks = [];

        // TABLE
        this.elements = [];

        // Creating the list table
        let table = document.createElement("table");
        table.className = "list";
        //table.style = "background-color: " + Label.arrToCSSColourString(allLabels[this.labelIndex].colour);
        this.elements.table = table
        
        // Creating the title text (in the form of a button)
        let thead = table.createTHead();
        let titleButton = Form.createButtonElement(this.title, function() {
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
        let newTaskButton = Form.createButtonElement("Create new task", this.newTaskButtonOnclick);
        // Storing "this" list because the "this" keyword in the onclick handler refers to the button HTML element instead of this list
        newTaskButton.list = this;
        let buttonRow = table.insertRow();
        buttonRow.className = "newTaskRow"
        let td = document.createElement("td");
        td.appendChild(newTaskButton)
        buttonRow.appendChild(td)
        table.appendChild(buttonRow);
    }

    addTask(task) {
        task.list = this;
        this.tasks.push(task)
        
        /*let mainLabelI = task.labelIndices.indexOf(this.labelIndex);
        switch(mainLabelI == -1) {
            case false:
                task.labelIndices.splice(mainLabelI, 1); // remove it first
            case true:
                task.labelIndices.unshift(this.labelIndex) // add to start   
                break; 
        }*/

        task.createOrUpdateTable(
            this.elements.table.insertRow(
                this.tasks.length - 1
            )
        );
    }

    removeTask(task) {
        this.tasks.splice(this.tasks.indexOf(task), 1);
    }

    newTaskButtonOnclick() {
        let newTask = new Task(/*{labelIndices: [this.list.labelIndex]}*/);
        TaskEditor.openWindow(newTask)
        this.list.addTask(newTask);
    }

    updateInfo(data) {
        this.title = data.title;
        //allLabels[this.labelIndex].title = data.title; // update label title
        //allLabels[this.labelIndex].colour = data.colour; // update label colour
    }

    updateTable() {
        this.elements.titleButton.innerHTML = this.title; // update title
        //this.elements.table.style = "background-color: " + Label.arrToCSSColourString(allLabels[this.labelIndex].colour); // update background colour
        updateLabelsEverywhere();
    }

    delete() {
        allLists.splice(allLists.indexOf(this), 1);
        this.elements.table.remove();
        delete this;
    }
}