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
        this.mainLabel = parseInt(data.mainLabel) || 0;  // used to determine which label the task will use as its border colour; set to 0 by default, but when it's used, a check is done to ensure task.labelIndices has a 0th element

        this.doingStart = data.doingStart || todayStr;
        this.doingEnd = data.doingEnd || todayStr;
        this.due = data.due || tmrwStr;
        this.dotw = (data.dotw != undefined) ? data.dotw.map(x => x == "true") : [true, true, true, true, true, true, true]; // days of the week
        //this.frequency = parseInt(data.frequency) || 0;
        this.priority = (data.priority != undefined) ? parseInt(data.priority) : 1;
        
        this.active = (data.active != undefined) ? (data.active == "true") : true;
        this.checked = (data.checked != undefined) ? (data.checked == "true") : false;
        this.checkedByDay = (data.checkedByDay != undefined) ? new function() {
            let op = {};
            for(let key in data.checkedByDay)
                op[key] = data.checkedByDay[key] == "true" // string => bool
            return op;
        } : [];

        this.optionals = {
            doingEnd: (data.optionals != undefined) ? data.optionals.doingEnd == "true" : false,
            due: (data.optionals != undefined) ? data.optionals.due == "true" : false
        };
        
        this.list = (data.listIndex != undefined) ? allLists[parseInt(data.listIndex)] : null; // this property is always set by its parent List, it will only be in "data" when fetched from database
        this.days = {}; // not being stored in db; this property is also always set by parent
    }

    objectify() {
        // compressing checkedByDay by excluding all false days
        let compressedCheckedByDay = {};
        for(let day in this.checkedByDay) {
            if(this.checkedByDay[day] == true) compressedCheckedByDay[day] = true;
        }

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
            checkedByDay: compressedCheckedByDay,
            
            listIndex: allLists.indexOf(this.list),
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

    _updateCheckByList(day) {
        let e = this.elements[day];  
        e.doneCheckbox.checked = this.checked;
        let table = e.table;
        if(this.checked)
            table.className += " listChecked";
        else
            table.className = table.className.replace(" listChecked", "");
        this.days[day].updateTaskPosition(this);
    }

    _setCheckByDay(day, val, save) {
        this.checkedByDay[day] = val;
        let e = this.elements[day];
        e.doneCheckbox.checked = val;
        let table = e.table;
        if(val)
            table.className += " dayChecked";
        else
            table.className = table.className.replace(" dayChecked", "");
        this.days[day].updateTaskPosition(this);
        if(save)
            pushToDB("tasks", "edit", {index: {
                list: allLists.indexOf(this.list),
                task: this.list.tasks.indexOf(this)
            }, object: this.objectify()});
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
        /*if(Task._areArraysEqual(this.dotw, [true, true, true, true, true, true, true]))
            dotwString = "All days";
        else*/ if(Task._areArraysEqual(this.dotw, [true, false, false, false, false, false, true]))
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

    createTable(parent, id) { // id is a unique identifier (which Day is setting as its unique date number) used for storing the specific set of elements into this.elements
        // SETUP
        let info = this._getInfoStrings();
        if(this.elements == undefined) // if this is the first time the table is being drawn
            this.elements = {};
        let e = this.elements;
        e[id] = {};

        // TABLE
        let table = document.createElement("table");
        table.className = "task";
        if(this.labelIndices.length > 0) {
            table.style = "border-color: " + Label.arrToCSSColourString(allLabels[this.labelIndices[this.mainLabel]].colour);
        }
        e[id].table = table;

        let row = table.insertRow();
        let cell = document.createElement("td");

        let titleCol = document.createElement("td");
        titleCol.className = "titleCol";
        titleCol.onclick = function() { 
            let txt = `<b>${this.title}</b><br><br>`;
            txt += this.description.replaceAll('\n', '<br>');
            openModal(txt);
        }.bind(this);
        cell.appendChild(titleCol);

        let buttonCol = document.createElement("td");
        buttonCol.className = "buttonCol";
        cell.appendChild(buttonCol);

        // TITLE
        let title = Form.createTextElement("p", this.title);
        e[id].title = title;
        titleCol.appendChild(title);
        
        // DONE TASK CHECKBOX
        let doneCheckbox = Form.createInputElement("checkbox", "done", false);
        doneCheckbox.className = "doneTaskBox";
        doneCheckbox.onclick = function() {
            if(this.checked) { // if user wants to uncheck a task that is checked by list
                e[id].doneCheckbox.checked = true; // revert the damage
                openModal("<b>Cannot uncheck task that is super-checked. Please uncheck the task in List View first.<b>")
            } else
                this._setCheckByDay(id, e[id].doneCheckbox.checked, true);
        }.bind(this);
        e[id].doneCheckbox = doneCheckbox;
        buttonCol.appendChild(doneCheckbox);
        
        
        // APPENDING
        row.appendChild(cell);
        parent.appendChild(table);

        // UPDATING CHECKBOX
        // this must be done after table has been appended
        this._updateCheckByList(id);
        if(!this.checked) this._setCheckByDay(id, this.checkedByDay[id], false); // set initial state of checkbox (save = false)
    }

    /*delete() {
        if(this.list)
            this.list.removeTask(this);
        for(let d of this.elements) {
            this.elements[d].table.remove();
        }
        pushToDB("lists", "edit", {index: allLists.indexOf(this.list), object: this.list.objectify()}); // since list holds task data, updating list in database
        delete this;
    }*/
}