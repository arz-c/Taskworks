class Task {
    constructor(data = {}) {
        const isNotEmpty = function(x) {
            return !(x == undefined || x == "[]");
        }

        let todayStr = dateObjToNumericDate(new Date());
        let tmrwStr = new Date();
        tmrwStr.setDate(tmrwStr.getDate() + 1);
        tmrwStr = dateObjToNumericDate(tmrwStr);

        // if undefined, will set to a default value, else, will set to given value
        // the (data.x != undefined) is only needed for those that require a type change from string -> other type (because everything from database is always in string form)
        this.title = data.title || "New task";
        this.description = data.description || "";

        this.labelIndices = isNotEmpty(data.labelIndices) ? data.labelIndices.map(x => parseInt(x)) : [];
        this.mainLabel = parseInt(data.mainLabel) || 0;  // used to determine which label the task will use as its border colour; set to 0 by default, but when it's used, a check is done to ensure task.labelIndices has a 0th element

        this.doingStart = data.doingStart || todayStr;
        this.doingEnd = data.doingEnd || todayStr;
        this.due = data.due || tmrwStr;
        this.dotw = isNotEmpty(data.dotw) ? data.dotw.map(x => x == "true") : [true, true, true, true, true, true, true]; // days of the week
        //this.frequency = parseInt(data.frequency) || 0;
        this.priority = isNotEmpty(data.priority) ? parseInt(data.priority) : 1;
        
        this.active = isNotEmpty(data.active) ? (data.active == "true") : true;
        this.checked = isNotEmpty(data.checked) ? (data.checked == "true") : false;
        this.checkedByDay = isNotEmpty(data.checkedByDay) ? new function() {
            let op = {};
            for(let key in data.checkedByDay)
                op[key] = data.checkedByDay[key] == "true" // string => bool
            return op;
        } : [];

        this.optionals = {
            doingEnd: isNotEmpty(data.optionals) ? data.optionals.doingEnd == "true" : false,
            due: isNotEmpty(data.optionals) ? data.optionals.due == "true" : false
        };
        
        this.list = isNotEmpty(data.listIndex) ? allLists[parseInt(data.listIndex)] : null; // this property is always set by its parent List, it will only be in "data" when fetched from database
        this.days = {}; // not being stored in db; this property is also always set by parent
        
        this.totalTasks = 0; // this number is set in main.js
        this.checkedTasks = 0; // this number is incremented as tasks get checked, and compared with totalTasks
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

        if(val) {
            table.className += " dayChecked";
            this.checkedTasks++;
        } else {
            table.className = table.className.replace(" dayChecked", "");
            if(save) this.checkedTasks--; // only do this if user is checking
        }

        this.days[day].updateTaskPosition(this);

        if(save) { // save only = true when user is clicking checkbox as opposed to the script
            this.scanForCheckByList();
            pushToDB("tasks", "edit", {index: {
                list: allLists.indexOf(this.list),
                task: this.list.tasks.indexOf(this)
            }, object: this.objectify()});
        }
    }

    scanForCheckByList() {
        if(this.checkedTasks == this.totalTasks) {
            this.checked = true;
            for(let day in this.elements) {
                this._updateCheckByList(day);
            }
        } else {
            this.checked = false;
            for(let day in this.elements) {
                this._updateCheckByList(day);
            }
        }
    }

    setToApproaching(day, type) { // type: 0 = upcoming, 1 = overdue
        let table = this.elements[day].table;
        if(table.className.indexOf((type == 0) ? " overdue" : " upcoming") != -1) {
            table.className = table.className.replace((type == 0) ? " overdue" : " upcoming", "");
        }
        table.className += (type == 0) ? " upcoming" : " overdue";
    }

    createTable(parent, id) { // id is a unique identifier (which Day is setting as its unique date number) used for storing the specific set of elements into this.elements
        // SETUP
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
            /*if(this.checked) { // if user wants to uncheck a task that is checked by list
                e[id].doneCheckbox.checked = true; // revert the damage
                openModal("<b>Cannot uncheck task that is super-checked. Please uncheck the task in List View first.<b>")
            } else {*/
                this._setCheckByDay(id, e[id].doneCheckbox.checked, true);
            //}
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
}