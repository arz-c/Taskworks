const DAY_STRINGS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function addTextToParent(parent, elementType, className, text,) {
    let element = document.createElement(elementType);
    let textNode = document.createTextNode(text);
    element.appendChild(textNode);
    if(className != null)
        element.className = className;
    parent.append(element);
    return element;
}

function getTodaysNumericDate() {
    let now = new Date();
    return parseInt(now.getMonth()) + 1 + '/' + now.getDate() + '/' + now.getFullYear();
}