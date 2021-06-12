class Task {
    constructor(data) {
        // if undefined, will set to null, else, will set to given value
        this.title = data.title || null;
        this.labels = data.labels || null;
        this.doingStart = data.doingStart || null;
        this.doingEnd = data.doingEnd || null;
        this.dotw = data.dotw || null; // days of the week
        this.due = data.due || null;
        this.priority = data.priority || null;
    }

    _numericToWrittenDate(numericDate) {
        // a numeric date follows: DD/MM/YYYY
        let date = new Date(numericDate);
        return MONTH_STRINGS[date.getMonth()] + " " + date.getDate();
    }

    _areArraysEqual(a, b) {
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
        let doingString = "";
        if(this.doingStart != null) {
            doingString = "Do: ";
            if(this.doingEnd == null || this.doingStart == this.doingEnd) {
                doingString += this._numericToWrittenDate(this.doingStart);
            } else {
                doingString += 
                    this._numericToWrittenDate(this.doingStart)
                    + " - " +
                    this._numericToWrittenDate(this.doingEnd)
            }
        }

        // DOTW String
        let dotwString = "";
        if(this._areArraysEqual(this.dotw, [true, true, true, true, true, true, true]))
            //dotwString = "All days";
            {}
        else if(this._areArraysEqual(this.dotw, [true, false, false, false, false, false, true]))
            dotwString = "Weekends";
        else if(this._areArraysEqual(this.dotw, [false, true, true, true, true, true, false]))
            dotwString = "Weekdays";
        else if(this.dotw != null) {
            for(let i = 0; i < this.dotw.length; i++) {
                if(this.dotw[i])
                    dotwString += DAY_STRINGS[i] + " ";
            }
            dotwString = dotwString.slice(0, dotwString.length - 1); // get rid of last space
        }

        // Priority String
        let priorityString;
        if(this.priority != null)
            priorityString = PRIORITY_LEVELS[this.priority];
        else
            priorityString = "";
        
        return {
            title: (this.title != null) ? this.title : "",
            labels: (this.labels != null && this.labels.length > 0) ? this.labels : "",
            doing: doingString,
            due: (this.due != null) ? "Due: " + this._numericToWrittenDate(this.due) : "",
            dotw: dotwString,
            priority: (this.priority != null) ? "Priority: " + priorityString.toLowerCase() : ""
        };
    }
      
    createOrUpdateTable(parent) {
        let info = this._getInfoStrings();
        let table = document.createElement("table");
        table.className = "task";

        if(this.elements == undefined) { // if this is the first time the table is being drawn
            this.elements = [];
        };

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

        for(let i = 0; i < info.labels.length; i++) {
            let label = allLabels[info.labels[i]];
            addTextToParent(labelTable, "td", "label", label.title).style =
                "border-color: " + Label.arrToCSSColourString(label.colour);/* +
                "; color: " + Label.arrToCSSColourString(hueInvert(label.colour));*/
        }

        // Creating edit task button
        let editTaskButton = document.createElement("button");
        editTaskButton.className = "editTaskButton";
        editTaskButton.onclick = function() {
            TaskEditor.openWindow(this.task);
        }
        // Storing "this" list because the "this" keyword in the onclick handler refers to the button HTML element instead of this list
        editTaskButton.task = this;
        editTaskButton.innerHTML = "Edit";

        // Appending elements to container, and container to row 
        if(headerRowContainer != undefined) {
            headerRowContainer.append(editTaskButton);
            headerRowContainer.appendChild(labelTable);
            headerRow.append(headerRowContainer);
        }

        // TITLE ROW
        if(this.elements.titleRow == undefined) {
            let titleRow = table.insertRow();
            addTextToParent(titleRow, "td", "title", info.title).colSpan = 2;
            this.elements.titleRow = titleRow;
        } else {
            this.elements.titleRow.children[0].innerHTML = info.title;
        }
    
        // DATES ROW
        if(this.elements.datesRow == undefined) {
            let datesRow = table.insertRow();
            addTextToParent(datesRow, "td", "dates alignLeft", info.doing).colSpan = 1;
            addTextToParent(datesRow, "td", "dates alignRight", info.due).colSpan = 1;
            this.elements.datesRow = datesRow;
        } else {
            this.elements.datesRow.children[0].innerHTML = info.doing;
            this.elements.datesRow.children[1].innerHTML = info.due;
        }
    
        // CONFIG ROW
        if(this.elements.configRow == undefined) {
            let configRow = table.insertRow();
            addTextToParent(configRow, "td", "config alignLeft", info.dotw).colSpan = 1;
            addTextToParent(configRow, "td", "config alignRight", info.priority).colSpan = 1;
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
        this.labels = data.labels;
        this.doingStart = data.doingStart;
        this.doingEnd = data.doingEnd;
        this.dotw = data.dotw;
        this.due = data.due;
        this.priority = data.priority;
    }
}