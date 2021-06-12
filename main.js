let lists = [];

TaskEditor.init();

allLabels.push(new Label("AP", [150, 255, 150]));
allLabels.push(new Label("Strings", [250, 250, 150]));
allLabels.push(new Label("Science", [100, 120, 20]));
allLabels.push(new Label("Math", [150, 150, 255]));
TaskEditor.updateLabels();
/*let x = 0;
allLabels.push(new Label("Math", [x, x, x]));*/

function newListButtonOnclick() {
    let title = prompt("Title: ");
    let label = new Label(
        title,
        Label.parseInput(prompt("Colour (R, G, B): "))
    );
    allLabels.push(label);
    TaskEditor.updateLabels();
    lists.push(new List(title, allLabels.length - 1));
}

let testTask = new Task({
    title: "Record playing performance assessment #5 (London Symphony)",
    labels: [1, 0],
    doingStart: "06/10/2021",
    doingEnd: "06/10/2021",
    due: "06/10/2021",
    dotw: [true, true, true, true, true, true, true],
    priority: 2
});

let testTask2 = new Task({
    title: "Test task 2",
    labels: [2, 0],
    doingStart: "06/08/2021",
    doingEnd: "07/10/2021",
    due: "06/10/2021",
    dotw: [false, true, true, true, true, true, false],
    priority: 0
});

let testTask3 = new Task({
    title: "Test task 3",
    labels: [3, 0],
    doingStart: "06/08/2021",
    doingEnd: "07/10/2021",
    due: "06/10/2021",
    dotw: [true, false, false, false, false, false, true],
    priority: 1
});

let testTask4 = new Task({
    title: "Test task 3",
    labels: [1, 3],
    doingStart: "06/08/2021",
    doingEnd: "07/10/2021",
    due: "06/10/2021",
    dotw: [true, false, false, false, false, false, true],
    priority: 1
});

let stringsList = new List("Strings", 1);
stringsList.addTask(testTask);
stringsList.addTask(testTask2);

let scienceList = new List("Science", 2);
scienceList.addTask(testTask3);

let mathList = new List("Math", 3);
mathList.addTask(testTask4);