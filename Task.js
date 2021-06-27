class Task {
    constructor(data = {}) {
        let todayStr = getTodaysNumericDate();
        // if undefined, will set to a default value, else, will set to given value
        this.title = data.title || "New task";
        this.labelIndices = data.labelIndices || [];
        this.doingStart = data.doingStart || todayStr;
        this.doingEnd = data.doingEnd || todayStr;
        this.dotw = data.dotw || [true, true, true, true, true, true, true]; // days of the week
        this.due = data.due || todayStr;
        this.priority = data.priority || 1;
        
        this.active = data.active || true;
        this.list = null; // this property is always set by its parent List
        this.checked = false;

        // setting timeout to reset done task checkbox every start of the day
        let rightNow = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0);
        tomorrow.setMinutes(0);
        tomorrow.setSeconds(0);
        tomorrow.setMilliseconds(0);
        let timeUntilTmrw = tomorrow.getTime() - rightNow.getTime();
        console.log(timeUntilTmrw);
        setTimeout(this._resetTimeoutCallback.bind(this), timeUntilTmrw); // .bind solves the issue of passing current context
    }

    _resetTimeoutCallback() {
        let todayInt = numericDateToInt(getTodaysNumericDate());
        console.log(todayInt, numericDateToInt(this.doingStart), numericDateToInt(this.doingEnd), this.dotw[new Date().getDay()])
        // only reset checkbox if active is true, and date is within this.doingStart and End, and today's dotw is in this.dotw
        if(
            this.active && 
            todayInt >= numericDateToInt(this.doingStart) &&
            todayInt <= numericDateToInt(this.doingEnd) &&
            this.dotw[new Date().getDay()]
        ) {
                this._setCheck(false);
                setTimeout(this._resetTimeoutCallback.bind(this), 24 * 60 * 60 * 1000); // since a fresh day start is garunteed here, set next timeout to 24 hours from now
        }
    }

    static _numericToWrittenDate(numericDate) {
        // a numeric date follows: YYYY-MM-DD
        // a written date follows: Mon #
        let date = new Date(numericDate);
        // increasing date by 1 because creating Date object using the numeric date format described above sets date 1 day behind for some reason
        let month = MONTH_STRINGS[date.getMonth()];
        if(date.getFullYear() != new Date().getFullYear())  // if parameter date's year is different than today's year
            return month + " " + date.getFullYear().toString().substr(0); // return YYY Mon
        else
            return month + " " + (date.getDate() + 1); // return Mon DD
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

    _setCheck(val) {
        this.checked = val;
        this.elements.doneCheckbox.checked = val;
        if(val)
            this.elements.table.className += " checked";
        else
            this.elements.table.className = "task";
        this.list.updateTaskPosition(this);
        console.log(this.elements.table);
    }

    _getInfoStrings() {
        // Doing Date String
        let doingString = "Do: ";
        if(this.doingStart == this.doingEnd) {
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
            due: "Due: " + Task._numericToWrittenDate(this.due),
            dotw: dotwString,
            priority: "Priority: " + priorityString.toLowerCase()
        };
    }
      
    createOrUpdateTable(parent) {
        if(this.elements == undefined) // if this is the first time the table is being drawn
            this.elements = [];

        let info = this._getInfoStrings();

        let table;
        if(this.elements.table == undefined) {
            table = document.createElement("table");
            table.className = "task";
            this.elements.table = table;
        } else
            table = this.elements.table;

        // HEADER ROW

        // Creating row and container - a td is used to hold the row so that the colSpan property can be edited
        let headerRow;
        let headerRowContainer;
        if(this.elements.headerRow == undefined) {
            headerRow = table.insertRow();
            headerRowContainer = document.createElement("td"); 
            headerRowContainer.colSpan = 2;
            this.elements.headerRow = headerRow;
        } else {
            headerRow = this.elements.headerRow;
        }

        // Creating labels
        // (a table is created within the task table so that the different labels can appear side-by-side with a gap)
        // (this can't be inside the headerRowContianer != undefined if statement because labels need to be created both during initial task creation and during task updates)
        let labelTable;
        if(this.elements.labelTable == undefined) {
            labelTable = document.createElement("table"); 
            labelTable.className = "labelTable"
            this.elements.labelTable = labelTable;
        } else {
            labelTable = this.elements.labelTable;
            labelTable.innerHTML = "";
        }

        for(let i = 0; i < info.labelIndices.length; i++) {
            let label = allLabels[info.labelIndices[i]];
            Form.addTextNodeTo(labelTable, "td", "label", label.title).style =
                "border-color: " + Label.arrToCSSColourString(label.colour);
        }

        // Creating static buttons and appending elements to container, and container to row 
        if(headerRowContainer != undefined) {
            // Creating edit task button
            let editTaskButton = Form.createButton("Edit", function() {
                TaskEditor.openWindow(this);
            }.bind(this), "editTaskButton");

            // Creating done task checkbox
            let doneCheckbox = Form.createInputElement("checkbox", "done", false);
            doneCheckbox.className = "doneTaskBox";
            doneCheckbox.onclick = function() {
                this._setCheck(this.elements.doneCheckbox.checked);
            }.bind(this);
            this.elements.doneCheckbox = doneCheckbox;

            // Appending
            headerRowContainer.append(editTaskButton);
            headerRowContainer.append(doneCheckbox);
            headerRowContainer.append(labelTable);
            headerRow.append(headerRowContainer);
            
        }

        // TITLE ROW
        if(this.elements.titleRow == undefined) {
            let titleRow = table.insertRow();
            Form.addTextNodeTo(titleRow, "td", "title", info.title).colSpan = 2;
            this.elements.titleRow = titleRow;
        } else {
            this.elements.titleRow.children[0].innerHTML = info.title;
        }
    
        // DATES ROW
        if(this.elements.datesRow == undefined) {
            let datesRow = table.insertRow();
            Form.addTextNodeTo(datesRow, "td", "dates alignLeft", info.doing).colSpan = 1;
            Form.addTextNodeTo(datesRow, "td", "dates alignRight", info.due).colSpan = 1;
            this.elements.datesRow = datesRow;
        } else {
            this.elements.datesRow.children[0].innerHTML = info.doing;
            this.elements.datesRow.children[1].innerHTML = info.due;
        }
    
        // CONFIG ROW
        if(this.elements.configRow == undefined) {
            let configRow = table.insertRow();
            Form.addTextNodeTo(configRow, "td", "config alignLeft", info.dotw).colSpan = 1;
            Form.addTextNodeTo(configRow, "td", "config alignRight", info.priority).colSpan = 1;
            this.elements.configRow = configRow
        } else {
            this.elements.configRow.children[0].innerHTML = info.dotw;
            this.elements.configRow.children[1].innerHTML = info.priority;
        }
        
        if(parent == undefined) // meaning the table is being updated/it already exists
            this.list.updateTaskPosition(this); // call list function that updates its position in the array and the list table
        else
            parent.appendChild(table);
    }

    updateInfo(data) {
        this.title = data.title;
        this.labelIndices = data.labelIndices;
        this.doingStart = data.doingStart;
        this.doingEnd = data.doingEnd;
        this.dotw = data.dotw;
        this.due = data.due;
        this.priority = data.priority;
        this.active = data.active;
    }

    archive() {
        if(this.list)
            this.list.removeTask(this);
        this.elements.table.remove();
        archivedTasks.push(this);
    }

    delete() {
        if(this.list)
            this.list.removeTask(this);
        this.elements.table.remove()
        delete this;
    }
}