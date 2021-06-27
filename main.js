Form.init();
ListEditor.init();
LabelEditor.init();
TaskEditor.init();

allLabels.push(new Label("AP", [150, 255, 150]));
allLabels.push(new Label("Strings", [250, 250, 150]));
allLabels.push(new Label("Science", [100, 120, 20]));
allLabels.push(new Label("Math", [150, 150, 255]));
TaskEditor.updateLabels();

function newListButtonOnclick() {
    let newList = new List();
    ListEditor.openWindow(newList)
    allLists.push(newList);
}

let testTask = new Task({
    title: "Record playing performance assessment #5 (London Symphony)",
    labelIndices: [0, 1],
    doingStart: "2021-06-10",
    doingEnd: "2021-06-10",
    due: "2021-06-10",
    dotw: [true, true, true, true, true, true, true],
    priority: 2
});

let testTask2 = new Task({
    title: "Test task 2",
    labelIndices: [0, 2],
    doingStart: "2021-06-08",
    doingEnd: "2021-07-10",
    due: "2021-07-10",
    dotw: [false, true, true, true, true, true, false],
    priority: 0
});

let testTask3 = new Task({
    title: "Test task 3",
    labelIndices: [0, 3],
    doingStart: "2022-06-08",
    doingEnd: "2023-07-10",
    due: "2024-07-10",
    dotw: [true, false, false, false, false, false, true],
    priority: 1
});

let testTask4 = new Task({
    title: "Test task 4",
    labelIndices: [1, 3],
    doingStart: "2021-06-08",
    doingEnd: "2021-07-10",
    due: "2021-07-10",
    dotw: [true, false, false, false, false, false, true],
    priority: 1
});

let stringsList = new List("Strings");
stringsList.addTask(testTask);
stringsList.addTask(testTask2);
allLists.push(stringsList);

let scienceList = new List("Science");
scienceList.addTask(testTask3);
allLists.push(scienceList);

let mathList = new List("Math");
mathList.addTask(testTask4);
allLists.push(mathList);