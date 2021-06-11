class List {
    constructor(title, label) {
        this.title = title || "";
        this.tasks = [];
        this.label = label;

        // Creating the list table
        this.table = document.createElement("table");
        this.table.className = "list";
        console.log(this.label)
        this.table.style = "background-color: " + Label.arrToCSSColourString(this.label.colour);
        
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
        task.createTable(
            this.table.insertRow(
                this.tasks.length - 1
            )
        );
    }

    newTaskButtonOnclick() {
        let todaysDate = getTodaysNumericDate();
        let newTask = new Task({
            title: prompt("Title: ") || null,
            labels: new function() {
                let op = Label.parseInput(prompt("Available Labels:\n" + allLabelsToString() + "\nLabel Indexes (0, 2, 1, ...): "));
                return (op.length > 0) ? op : null;
            },
            doing: {
                start: prompt("Doing Start Date (MM/DD/YYYY): ", todaysDate) || null,
                end: prompt("Doing End Date (MM/DD/YYYY): ", todaysDate) || null
            },
            due: prompt("Due Date (MM/DD/YYYY): ", todaysDate) || null,
            dotw: prompt("Days of The Week (DDD DDD DDD ...): ", "All days") || null,
            priority: prompt("Priority (low, medium, high): ", "medium") || null
        });
        this.list.addTask(newTask);
    }
}