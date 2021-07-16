Form.init();
ListEditor.init();
LabelEditor.init();
TaskEditor.init();

fetchFromDB(function() {
    let res = JSON.parse(this.response);
    for(let o of res.labels) {
        allLabels.push(new Label(o));
    }
    updateLabelsEverywhere();
    for(let o of res.lists) {
        allLists.push(new List(o));
    }
    for(let o of res.archivedTasks) {
        o.archived = true;
        archivedTasks.push(new Task(o));
    }
    for(let o of res.archivedLists) {
        o.archived = true;
        archivedLists.push(new List(o));
    }
});