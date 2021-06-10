let lists = [];

function newListButtonOnclick() {
    lists.push(new List(prompt("Title: ")));
}

let testTask = new Task({
    title: "Record playing performance assessment #5 (London Symphony)",
    labels: [
        {
            text: "Strings",
            colour: [255, 150, 150]
        }, {
            text: "AP",
            colour: [150, 255, 150]
        }
    ],
    doing: {
        start: "06/10/2021",
        end: "06/10/2021"
    },
    due: "06/10/2021",
    dotw: "All days",
    priority: "High"
});

let testTask2 = new Task({
     
    title: "Test Task 2",
    labels: [
        {
            text: "Math",
            colour: [150, 150, 255]
        }, {
            text: "AP",
            colour: [150, 255, 150]
        },
    ],
    doing: {
        start: "06/08/2021",
        end: "07/10/2021"
    },
    due: "06/10/2021",
    dotw: "Weekdays",
    priority: "Low"
});

let testList = new List("Strings");
testList.addTask(testTask);
testList.addTask(testTask2);

let testList2 = new List("Test List");
testList2.addTask(testTask);