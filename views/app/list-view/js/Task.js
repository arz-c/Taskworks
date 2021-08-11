class Task {
    constructor(data = {}) {
        let todayStr = dateObjToNumericDate(new Date());
        let tmrwStr = new Date();
        tmrwStr.setDate(tmrwStr.getDate() + 1);
        tmrwStr = dateObjToNumericDate(tmrwStr);

        // if undefined, will set to a default value, else, will set to given value
        // the (data.x != undefined) is only needed for those that require a type change from string -> other type (because everything from database is always in string form)
        this.title = data.title || "New task";
        this.description = data.description || "";

        this.labelIndices = (data.labelIndices != undefined) ? data.labelIndices.map(x => parseInt(x)) : [];
        this.mainLabel = parseInt(data.mainLabel) || 0; // used in Calendar View to determine which label the task will use as its border colour; set to 0 by default, but when it's used, a check is done to ensure task.labelIndices has a 0th element
        
        this.doingStart = data.doingStart || todayStr;
        this.doingEnd = data.doingEnd || todayStr;
        this.due = data.due || tmrwStr;
        this.dotw = (data.dotw != undefined) ? data.dotw.map(x => x == "true") : [true, true, true, true, true, true, true]; // days of the week
        //this.frequency = parseInt(data.frequency) || 0;
        this.priority = (data.priority != undefined) ? parseInt(data.priority) : 1;
        
        this.active = (data.active != undefined) ? (data.active == "true") : true;
        this.checked = (data.checked != undefined) ? (data.checked == "true") : false;
        this.checkedByDay = data.checkedByDay || []; // since this isn't being used in List View, no need to convert string => bool as we are in Calendar View's Task

        this.optionals = {
            doingEnd: (data.optionals != undefined) ? data.optionals.doingEnd == "true" : false,
            due: (data.optionals != undefined) ? data.optionals.due == "true" : false
        };
        
        this.list = (data.listIndex != undefined) ? allLists[parseInt(data.listIndex)] : null; // this property is always set by its parent List, it will only be in "data" when fetched from database

        // TIMEOUTS
        // setting timeout for approaching tasks (upcoming/overdue)
        if(this.optionals.due) // since duedates are optional, don't set approaching timeout if duedate is disabled
            this._setApproachingTimeout();
    }

    objectify() {
        return {
            title: this.title,
            description: this.description,

            labelIndices: this.labelIndices,
            mainLabel: this.mainLabel,

            doingStart: this.doingStart,
            doingEnd: this.doingEnd,
            due: this.due,
            dotw: this.dotw,
            //frequency: this.frequency,
            priority: this.priority,

            optionals: this.optionals,
                
            active: this.active,
            checked: this.checked,
            checkedByDay: this.checkedByDay,
            
            listIndex: allLists.indexOf(this.list),
        }
    }

    updateInfo(data) {
        this.title = data.title;
        this.description = data.description;
        
        this.labelIndices = data.labelIndices;
        this.mainLabel = data.mainLabel;

        this.doingStart = data.doingStart;
        this.doingEnd = data.doingEnd;
        this.due = data.due;
        this.dotw = data.dotw;
        //this.frequency = data.frequency;
        this.priority = data.priority;

        this.optionals = data.optionals;

        this.active = data.active;

        if(this.optionals.due) // since duedates are optional, don't set approaching timeout if duedate is disabled
            this._setApproachingTimeout();
        else
            this._clearApproachingStyles();
        pushToDB("lists", "edit", {index: allLists.indexOf(this.list), object: this.list.objectify()}); // since list holds task data, updating list in database
    }

    _resetTimeoutCallback() {
        let todayInt = numericDateToInt(dateObjToNumericDate(new Date()));
        if(
            this.active &&
            this.checked &&
            todayInt >= numericDateToInt(this.doingStart) &&
            todayInt <= numericDateToInt(this.doingEnd) &&
            this.dotw[new Date().getDay()]
        ) {
                this._setCheck(false);
                setTimeout(this._resetTimeoutCallback.bind(this), 24 * 60 * 60 * 1000); // since a fresh day start is garunteed here, set next timeout to 24 hours from now
        }
    }

    _setApproachingTimeout() {
        if(this.approachingTimeout != undefined)
            clearTimeout(this.approachingTimeout);
        this._clearApproachingStyles();
        
        let rightNow = new Date();
        let upcoming = new Date(this.due);
        setDateObjToDayStart(upcoming);
        //upcoming.setDate(upcoming.getDate() - 1); // don't need this step because the date object is auto set 1 day behind for some reason
        let deltaT = upcoming.getTime() - rightNow.getTime();

        if(deltaT > 1000 * 60 * 60 * 24) { // if greater than a day (can't let it get really big because setTimeout has a 32-bit limit)
            //console.log(`'${this.title}' will not be set to  'approaching due-date' since due-date is too far away`);            
            return;
        } else if(deltaT >= 0) { // don't print this message if the task is already approaching
            console.log(`'${this.title}' will be set to 'approaching due-date' in ` +
                `${Math.floor(deltaT / 1000 / 60 / 60)} hours and ` +
                `${Math.round(deltaT / 1000 / 60 % 60)} minutes`);
        }
        
        this.approachingTimeout = setTimeout(
            function() { this._approachingTimeoutCallback(this, 0); }.bind(this)
        , deltaT);
    }

    _clearApproachingStyles() {
        if(this.elements != undefined) {
            let table = this.elements.table;
            table.className = table.className.replace("upcoming", "");
            table.className = table.className.replace("overdue", "");
        }
    }

    _approachingTimeoutCallback(context, type) { // type: 0 = upcoming, 1 = overdue 
        let table = context.elements.table;
        if(table.className.indexOf((type == 0) ? " overdue" : " upcoming") != -1) {
            table.className = table.className.replace((type == 0) ? " overdue" : " upcoming", "");
        }
        table.className += (type == 0) ? " upcoming" : " overdue";
        if(type == 0) { // set overdue timeout
            let today = new Date();
            setDateObjToDayStart(today);
            let due = new Date(context.due);
            setDateObjToDayStart(due);
            due.setDate(due.getDate() + 1) // need to add 1 because date obj is auto set 1 day behind for some reason

            setTimeout(function() { this._approachingTimeoutCallback(context, 1) }.bind(this), due.getTime() - today.getTime());
        }
        /*if(!this.checked) // if task is checked, apporaching styles aren't visible so no point in printing message
            console.log(`'${this.title}' is '${(type == 0) ? "upcoming" : "overdue"}'`)*/
    }

    static _numericToWrittenDate(numericDate) {
        // a numeric date follows: YYYY-MM-DD
        // a written date follows: Mon #
        let date = new Date(numericDate);
        date.setDate(date.getDate() + 1) // increasing date by 1 because creating Date object using the numeric date format described above sets date 1 day behind for some reason
        let month = MONTH_STRINGS[date.getMonth()];
        if(date.getFullYear() != new Date().getFullYear())  // if parameter date's year is different than today's year
            return month + " " + date.getFullYear().toString().substr(0); // return YYY Mon
        else
            return month + " " + date.getDate(); // return Mon DD
    }

    static _areArraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
      
        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
    }

    _setCheck(val, shouldPushToDB = true) {
        this.checked = val;
        this.elements.doneCheckbox.checked = val;
        let table = this.elements.table;
        if(val)
            table.className += " checked";
        else
            table.className = table.className.replace(" checked", "");
        this.list.updateTaskPosition(this);
        if(shouldPushToDB) pushToDB("lists", "edit", {index: allLists.indexOf(this.list), object: this.list.objectify()}); // since list holds task data, updating list in database
    }

    _getInfoStrings() {
        // Doing Date String
        let doingString = "Do: ";
        if(this.doingStart == this.doingEnd || !this.optionals.doingEnd) {
            doingString += Task._numericToWrittenDate(this.doingStart);
        } else {
            doingString += 
                Task._numericToWrittenDate(this.doingStart)
                + " - " +
                Task._numericToWrittenDate(this.doingEnd)
        }
        
        // DOTW String
        let dotwString = "";
        if(Task._areArraysEqual(this.dotw, [true, true, true, true, true, true, true]))
            //dotwString = "All days";
            {}
        else if(Task._areArraysEqual(this.dotw, [true, false, false, false, false, false, true]))
            dotwString = "Weekends";
        else if(Task._areArraysEqual(this.dotw, [false, true, true, true, true, true, false]))
            dotwString = "Weekdays";
        else  {
            for(let i = 0; i < this.dotw.length; i++) {
                if(this.dotw[i])
                    dotwString += DAY_STRINGS[i] + " ";
            }
            dotwString = dotwString.slice(0, dotwString.length - 1); // get rid of last space
        }

        // Priority String
        let priorityString = PRIORITY_LEVELS[this.priority];

        return {
            title: this.title,
            labelIndices: (this.labelIndices.length) ? this.labelIndices : "",
            doing: doingString,
            due: (this.optionals.due) ? "Due: " + Task._numericToWrittenDate(this.due) : "",
            dotw: dotwString,
            priority: "Priority: " + priorityString.toLowerCase()
        };
    }

    _createLabelTable(info, labelTable) {
        // Creating labels
        // (a table is created within the task table so that the different labels can appear side-by-side with a gap)
        // (this can't be inside the headerRowContianer != undefined if statement because labels need to be created both during initial task creation and during task updates)
        for(let i = 0; i < info.labelIndices.length; i++) {
            let label = allLabels[info.labelIndices[i]];
            Form.addTextNodeTo(labelTable, "td", "label", label.title).style =
                "border-color: " + Label.arrToCSSColourString(label.colour);
        }
    }

    createTable(parent, id) { // id is a unique identifier (which Day is setting as its unique date number) used for storing the specific set of elements into this.elements
        // SETUP
        let info = this._getInfoStrings();
        if(this.elements == undefined) // if this is the first time the table is being drawn
            this.elements = {};
        let e = this.elements;

        // TABLE
        let table = document.createElement("table");
        table.className = "task";
        e.table = table;

        // HEADER ROW
        // Creating row and container - a td is used to hold the row so that the colSpan property can be edited
        let headerRow = table.insertRow();
        let headerRowContainer = document.createElement("td"); 
        headerRowContainer.colSpan = 2;
        e.headerRow = headerRow;

        // Labels
        let labelTable = document.createElement("table"); 
        labelTable.className = "labelTable"
        e.labelTable = labelTable;
        this._createLabelTable(info, labelTable);

        // Static Buttons
        // creating edit task button
        let editTaskButton = Form.createButton("Edit", function() {
            TaskEditor.openWindow(this);
        }.bind(this), "editTaskButton");

        // creating done task checkbox
        let doneCheckbox = Form.createInputElement("checkbox", "done", false);
        doneCheckbox.className = "doneTaskBox";
        doneCheckbox.onclick = function() {
            this._setCheck(e.doneCheckbox.checked);
        }.bind(this);
        e.doneCheckbox = doneCheckbox;

        // Appending
        let labelCol = document.createElement("td");
        labelCol.appendChild(labelTable);
        let buttonCol = document.createElement("td");
        buttonCol.appendChild(editTaskButton);
        buttonCol.appendChild(doneCheckbox);
        headerRowContainer.appendChild(labelCol);
        headerRowContainer.appendChild(buttonCol);
        headerRow.append(headerRowContainer);

        // TITLE ROW
        let titleRow = table.insertRow();
        titleRow.className = "title";
        Form.addTextNodeTo(titleRow, "td", null, info.title).colSpan = 2;
        e.titleRow = titleRow;

        // DATES ROW
        let datesRow = table.insertRow();
        datesRow.className = "dates";
        Form.addTextNodeTo(datesRow, "td", "alignLeft", info.doing).colSpan = 1;
        Form.addTextNodeTo(datesRow, "td", "alignRight", info.due).colSpan = 1;
        e.datesRow = datesRow;

        // CONFIG ROW
        let configRow = table.insertRow();
        configRow.className = "config";
        Form.addTextNodeTo(configRow, "td", "alignLeft", info.dotw).colSpan = 1;
        Form.addTextNodeTo(configRow, "td", "alignRight", info.priority).colSpan = 1;
        e.configRow = configRow

        // APPENDING
        parent.appendChild(table);

        // SETTING CHECK
        this._setCheck(this.checked, false); // false at the end because don't want to push to DB before this.list is even added to allLists
    }
      
    updateTable() {
        // SETUP
        let info = this._getInfoStrings();
        let e = this.elements;
        
        // HEADER ROW -> LABEL TABLE
        e.labelTable.innerHTML = ""; // empty label first
        this._createLabelTable(info, e.labelTable);

        // TITLE ROW
        e.titleRow.children[0].innerHTML = info.title;
    
        // DATES ROW
        e.datesRow.children[0].innerHTML = info.doing;
        e.datesRow.children[1].innerHTML = info.due;
    
        // CONFIG ROW
        e.configRow.children[0].innerHTML = info.dotw;
        e.configRow.children[1].innerHTML = info.priority;

        // CHECKED OR NOT
        this._setCheck(this.checked);

        // PUSHING UPDATES
        this.list.updateTaskPosition(this) // calling list function that updates its position in the array and the list table
    }

    delete() {
        if(this.list)
            this.list.removeTask(this);
        this.elements.table.remove()
        pushToDB("lists", "edit", {index: allLists.indexOf(this.list), object: this.list.objectify()}); // since list holds task data, updating list in database
        delete this;
    }
}