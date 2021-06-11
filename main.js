let lists = [];

allLabels.push(new Label("AP", [150, 255, 150]));
allLabels.push(new Label("Strings", [250, 250, 150]));
allLabels.push(new Label("Science", [100, 120, 20]));
allLabels.push(new Label("Math", [150, 150, 255]));
/*let x = 0;
allLabels.push(new Label("Math", [x, x, x]));*/


function newListButtonOnclick() {
    let title = prompt("Title: ");
    let label = new Label(
        title,
        Label.parseInput(prompt("Colour (R, G, B): "))
    );
    allLabels.push(label);
    console.log(label);
    lists.push(new List(title, label));
}

let testTask = new Task({
    title: "Record playing performance assessment #5 (London Symphony)",
    labels: [1, 0],
    doing: {
        start: "06/10/2021",
        end: "06/10/2021"
    },
    due: "06/10/2021",
    dotw: "All days",
    priority: "High"
});

let testTask2 = new Task({
    title: "Test task 2",
    labels: [2, 0],
    doing: {
        start: "06/08/2021",
        end: "07/10/2021"
    },
    due: "06/10/2021",
    dotw: "Weekdays",
    priority: "Low"
});

let testTask3 = new Task({
    title: "Test task 3",
    labels: [3, 0],
    doing: {
        start: "06/08/2021",
        end: "07/10/2021"
    },
    due: "06/10/2021",
    dotw: "Weekdays",
    priority: "Low"
});

let stringsList = new List("Strings", allLabels[1]);
stringsList.addTask(testTask);
stringsList.addTask(testTask2);

let scienceList = new List("Science", allLabels[2]);
scienceList.addTask(testTask2);

let mathList = new List("Math", allLabels[3]);
mathList.addTask(testTask3);