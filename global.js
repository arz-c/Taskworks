const DAY_STRINGS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PRIORITY_LEVELS = ["Low", "Medium", "High"];

let allLabels = [];
let allLists = [];

let archivedTasks = [];
let archivedLists = [];

function updateLabelsEverywhere() {
    TaskEditor.updateLabels();
    for(let list of allLists) {
        for(let task of list.tasks) {
            task.createOrUpdateTable();
        }
    }
}

function dateObjToNumericDate(date) {
    return(
        date.getFullYear() + '-' +
        (parseInt(date.getMonth()) + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) + '-' +
        date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
    );
}

function getTodaysNumericDate() {
    return dateObjToNumericDate(new Date());
}

function numericDateToInt(date) {
    date = date.split('-');
    return(
        365 * parseInt(date[2]) +
        30.5 * parseInt(date[0]) +
        parseInt(date[1])
    );
}



/*function getAllLabelsStrArray() {
    let arr = [];
    for(let i = 0; i < allLabels.length; i++) {
        arr.push(allLabels[i].toString());
    }
    return arr;
}*/

/*function getReverseGreyscale(colour) {
    return 255 * (1 - (colour[0] + colour[1] + colour[2]) / (255 + 255 + 255));
}

function getTextShadowOfColour(width, colour) {
    return "text-shadow:" + 
                "-" + width + "em -" + width + "em 0 " +  colour +
                ", " + width + "em -" + width + "em 0 " +  colour +
                ", -" + width + "em " + width + "em 0 " +  colour +
                ", " + width + "em " + width + "em 0 " +  colour
}

// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
function rgb2hsv(r,g,b) {
    let v=Math.max(r,g,b), c=v-Math.min(r,g,b);
    let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c)); 
    return [60*(h<0?h+6:h), v&&c/v, v];
}

// input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
function hsv2rgb(h,s,v) {                              
    let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
    return [f(5),f(3),f(1)];       
}

function hueInvert(c) {
    let HSV = rgb2hsv(
        1 - c[0] / 255,
        1 - c[1] / 255,
        1 - c[2] / 255
    );
    let oneBasedRGB = hsv2rgb(360 - HSV[0], 1 - HSV[1], HSV[2]);
    let RGB = []
    for(let c of oneBasedRGB) {
        RGB.push(c * 255);
    }
    return RGB;
}*/