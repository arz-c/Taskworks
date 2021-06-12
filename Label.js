class Label {
    constructor(title, colour) {
        this.title = title,
        this.colour = colour
        // IMPORTANT: whenever a new label is added to allLabels, TaskEditor.updateLabels() must be called
        // it can't be called from here because by the time it would be called, the label would not be appended to allLabels yet
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

    toString() {
        return this.title/* + " (" + this.colour.toString() + ")"*/;
    }
}