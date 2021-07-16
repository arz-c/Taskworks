const DAY_STRINGS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTH_STRINGS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PRIORITY_LEVELS = ["Low", "Medium", "High"];

let allLabels = [];
let allLists = [];
let allTasks = [];

let archivedLists = [];
let archivedTasks = [];

const _myDatabaseID = document.getElementById("databaseID").innerHTML; // a unique ID provided by the server, used to verify when communicating with database

function _serialize(obj, parent = null) {
    let str = [];
    let o;
    if(typeof(obj.objectify) == "function")
        o = obj.objectify();
    else
        o = obj;
    for(let p in o) {
        if(typeof(o[p]) == "object") {
            let oo;
            if(typeof(o[p].objectify) == "function")
                oo = o[p].objectify();
            else
                oo = o[p];
            for(let pp in oo) {
                if(typeof(oo[pp]) == "object")
                    str.push(_serialize(oo[pp], (parent != null) ? parent + "[" + p + "]" + "[" + pp + "]" : p + "[" + pp + "]"));
                else {
                    if(parent != null)
                        str.push(parent + "[" + encodeURIComponent(p) + "]" + "[" + encodeURIComponent(pp) + "]=" + encodeURIComponent(oo[pp]))
                    else
                        str.push(encodeURIComponent(p) + "[" + encodeURIComponent(pp) + "]=" + encodeURIComponent(oo[pp]))
                }
            }
        } else {
            if(parent != null)
                str.push(parent + "[" + encodeURIComponent(p) + "]" + "=" + encodeURIComponent(o[p]));
            else
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(o[p]));
        }
    }
    return str.join("&");
}

function _sendHTTPRequest(reqType, url, urlParams, callback = null) {
    // Create the request object
    const xhttp = new XMLHttpRequest();

    // Define a callback function
    if(callback != null)
        xhttp.onload = callback.bind(xhttp);
    else {
        xhttp.onload = function() {
            console.log("Response:", xhttp.response);
        }
    }

    // Send a request
    xhttp.open(reqType, url + ((urlParams != null) ? "?" + _serialize(urlParams) : ""));
    xhttp.send();
}

function pushToDB(type, action, payload) {
    _sendHTTPRequest(
        "POST", "/database", {
        header: {
            type: type,
            action: action,
            id: _myDatabaseID
        },
        payload: _serialize(payload)
    });
}

function fetchFromDB(callback) {
    return _sendHTTPRequest(
        "GET", "/database",
        {id: _myDatabaseID},
        callback
    )
}

function updateLabelsEverywhere() {
    for(let list of allLists) {
        for(let task of list.tasks) {
            task.updateTable();
        }
    }
}

function setDateObjToDayStart(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
}

function dateObjToNumericDate(date) {
    return(
        date.getFullYear() + '-' +
        (parseInt(date.getMonth()) + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) + '-' +
        date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
    );
}

function numericDateToInt(date) {
    date = date.split('-');
    return(
        365 * parseInt(date[0]) +
        30.5 * parseInt(date[1]) +
        parseInt(date[2])
    );
}

function openModal(msg) {
    document.getElementById("modalText").innerHTML = msg;
    document.getElementById("modal").style.display = "block";
}