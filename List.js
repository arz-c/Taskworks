class List {
    constructor(title) {
        this.title = title || "";
        this.tasks = [];

        this.table = document.createElement("table");
        this.table.className = "list";
        
        let thead = this.table.createTHead();
        addTextToParent(thead, "th", null, this.title);
        let newListButton = document.getElementById("newListButton")
        document.body.insertBefore(this.table, newListButton);

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
                let op = [];
                let total = parseInt(prompt("Number of labels: "));
                for(let i = 1; i < total + 1; i++) {
                    let text = prompt("Name for label #" + i + ": ");
                    let colour = prompt("Colour for label #" + i + " (R, G, B): ").replaceAll(' ', '').split(',');
                    for(let i = 0; i < colour.length; i++) {
                        colour[i] = parseInt(colour[i]);
                    }
                    op.push({
                        text: text,
                        colour: colour
                    });
                }
                return op;
            },
            doing: {
                start: prompt("Doing Start Date (MM/DD/YYYY): ", todaysDate) || null,
                end: prompt("Doing End Date (MM/DD/YYYY): ", todaysDate) || null
            },
            due: prompt("Due Date (MM/DD/YYYY): ", todaysDate) || null,
            dotw: prompt("Days of the week (DDD DDD DDD ...): ", "All days") || null,
            priority: prompt("Priority (low, medium, high): ") || null
        });
        this.list.addTask(newTask);
    }
}