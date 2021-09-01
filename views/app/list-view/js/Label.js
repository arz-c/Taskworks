class Label {
    constructor(data = {}) {
        const isNotEmpty = function(x) {
            return !(x == undefined || x == "[]");
        }

        this.title = data.title || "New label";
        this.colour = isNotEmpty(data.colour) ? data.colour.map(x => parseInt(x)) : [0, 0, 0];
        // IMPORTANT: whenever a new label is added to allLabels, TaskEditor.updateLabels() must be called
        // it can't be called from here because by the time it would be called, the new label would not be appended to allLabels yet
        
        // in the case that an existing label is updated, updateLabelsEverywhere(), a global function, must be called to update
        // all labels present within all tasks
    }

    objectify() {
        return {
            title: this.title,
            colour: this.colour
        }
    }

    updateInfo(data) {
        this.title = data.title;
        this.colour = data.colour;
        pushToDB("labels", "edit", {index: allLabels.indexOf(this), object: this.objectify()});
    }

    static parseInput(inputStr) {
        if(inputStr == null)
            return [];
        let inputArr = inputStr.replace(' ', '').split(',');
        for(let i = 0; i < inputArr.length; i++) {
            inputArr[i] = parseInt(inputArr[i]);
        }
        return inputArr;
    }

    static arrToCSSColourString(colourArr) {
        return "rgb(" +
            colourArr[0] + ", " + 
            colourArr[1] + ", " + 
            colourArr[2] +
        ")";
    }

    // only need these functions for testing purposes, so I can still hardcode lists more easily using RGB instead of hex in main.js:
    static hexToArr(hex) { 
        // #XXXXXX -> ["XX", "XX", "XX"]
        let result = hex.match(/[A-Za-z0-9]{2}/g);

        // ["XX", "XX", "XX"] -> [n, n, n]
        result = result.map(function(v) { return parseInt(v, 16) });

        return result;
    }

    static arrToHex(arr) {
        return '#' + arr.map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }).join('');
    }
    // -----------------

    toString() {
        return this.title/* + " (" + this.colour.toString() + ")"*/;
    }

    delete() {
        // can't use updateLabelsEverywhere() here because need to remove the deleted label from each task's labelIndices before calling the task's updateTable function
        let toBeDeletedL = allLabels.indexOf(this); // toBeDeletedL is actually an index as well, since all labels are based on their index in allLabels
        for(let list of allLists) {
            for(let task of list.tasks) {
                let toBeDeletedI = task.labelIndices.indexOf(toBeDeletedL);
                if(toBeDeletedI != -1)
                    task.labelIndices.splice(toBeDeletedI, 1);
                task.updateTable();
            }
        }
        let allLabelsIndex = allLabels.indexOf(this);
        pushToDB("labels", "remove", {index: allLabelsIndex});
        allLabels.splice(allLabelsIndex, 1);
        TaskEditor.updateLabels();
        delete this;
    }
}