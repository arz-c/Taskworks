class Task {
    constructor(data) {
        this.title = data.title;
        this.labels = null;
        this.labels = null;
        this.doing = {
            start: null,
            end: null,
        }
        this.dotw = null; // days of the week
        this.due = null;
        this.priority = null;

        this.labels = data.labels;
        this.doing.start = data.doing.start;
        this.doing.end = data.doing.end;
        this.dotw = data.dotw;
        this.due = data.due;
        this.priority = data.priority;
    }

    _numericToWrittenDate(numericDate) {
        // a numeric date follows: DD/MM/YYYY
        let date = new Date(numericDate);
        return MONTH_STRINGS[date.getMonth()] + " " + date.getDate();
    }

    _getInfo() {
        let doingString = null;
        if(this.doing.start != null) {
            doingString = "Do: ";
            if(this.doing.end == null || this.doing.start == this.doing.end) {
                doingString += this._numericToWrittenDate(this.doing.start);
            } else {
                doingString += 
                    this._numericToWrittenDate(this.doing.start)
                    + " - " +
                    this._numericToWrittenDate(this.doing.end)
            }
        }
        
        return {
            title: (this.title != null) ? this.title : "",
            labels: (this.labels.length != 0) ? this.labels : "",
            doing: doingString,
            due: (this.due != null) ? "Due: " + this._numericToWrittenDate(this.due) : "",
            dotw: (this.dotw != null && this.dotw != "All days") ? this.dotw : "",
            priority: (this.priority != null) ? this.priority.toLowerCase() : ""
        };
    }
      
    createTable(parent) {
        let info = this._getInfo();
        let table = document.createElement("table");
        table.className = "task";

        // HEADER ROW

        // Creating row and container - a td is used to hold the row so that the colSpan property can be edited
        let headerRow = table.insertRow();
        let headerRowContainer = document.createElement("td"); 
        headerRowContainer.colSpan = 2;

        // Creating table - a table is created within the task table so that the different labels can appear side-by-side with a gap
        let labelTable = document.createElement("table"); 
        labelTable.className = "labelTable"
        for(let i = 0; i < info.labels.length; i++) {
            let label = info.labels[i];
            let colour = label.colour;
            addTextToParent(labelTable, "td", "label", label.text).style =
            "background-color: rgb(" +
                colour[0] + ", " + 
                colour[1] + ", " + 
                colour[2] +
            ")";
        }

        // Creating edit task button
        let editTaskButton = document.createElement("button");
        editTaskButton.className = "editTaskButton";
        editTaskButton.innerHTML = "Edit";

        // Appending elements to container, and container to row 
        headerRowContainer.append(editTaskButton);
        headerRowContainer.appendChild(labelTable);
        headerRow.append(headerRowContainer);

        // TITLE ROW
        let titleRow = table.insertRow();
        addTextToParent(titleRow, "td", "title", info.title).colSpan = 2;
    
        // DATES ROW
        let datesRow = table.insertRow();
        addTextToParent(datesRow, "td", "dates alignLeft", info.doing).colSpan = 1;
        addTextToParent(datesRow, "td", "dates alignRight", info.due).colSpan = 1;
    
        // CONFIG ROW
        let configRow = table.insertRow();
        addTextToParent(configRow, "td", "config alignLeft", info.dotw).colSpan = 1;
        addTextToParent(configRow, "td", "config alignRight", "Priority: " + info.priority).colSpan = 1;
    
        parent.appendChild(table);
    }
}