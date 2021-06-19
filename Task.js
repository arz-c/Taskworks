class Task {
    constructor(data = {}) {
        this.list = null; // this property is always set by its parent List
        // if undefined, will set to a default value, else, will set to given value
        let today = getTodaysNumericDate();
        this.title = data.title || "New task";
        this.labelIndices = data.labelIndices || [];
        this.doingStart = data.doingStart || today;
        this.doingEnd = data.doingEnd || today;
        this.dotw = data.dotw || [true, true, true, true, true, true, true]; // days of the week
        this.due = data.due || today;
        this.priority = data.priority || 0;
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

        // Creating table - a table is created within the task table so that the different labels can appear side-by-side with a gap
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
                "border-color: " + Label.arrToCSSColourString(label.colour);/* +
                "; color: " + Label.arrToCSSColourString(hueInvert(label.colour));*/
        }

        // Creating edit task button
        let editTaskButton = Form.createButton("Edit", function() {
            TaskEditor.openWindow(this.task);
        }, "editTaskButton");
        // Storing "this" list because the "this" keyword in the onclick handler refers to the button HTML element instead of this list
        editTaskButton.task = this;

        // Appending elements to container, and container to row 
        if(headerRowContainer != undefined) {
            headerRowContainer.append(editTaskButton);
            headerRowContainer.appendChild(labelTable);
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
        
        if(parent != undefined)
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
    }

    delete() {
        if(this.list)
            this.list.removeTask(this);
        this.elements.table.remove();
        delete this;
    }
}