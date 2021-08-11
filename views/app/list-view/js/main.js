Form.init();
ListEditor.init();
CheckedListsEditor.init();
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
});