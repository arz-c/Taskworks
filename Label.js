class Label {
    constructor(title, colour) {
        this.title = title,
        this.colour = colour
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
        return this.title + " (" + this.colour.toString() + ")";
    }
}