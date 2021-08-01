fetchFromDB(function() {
    let res = JSON.parse(this.response);
    for(let o of res.labels) {
        allLabels.push(new Label(o));
    }
    updateLabelsEverywhere();
    for(let o of res.lists) {
        allLists.push(new List(o));
    }
    for(let l of allLists) {
        for(let t of l.tasks) {
            allTasks.push(t);
        }
    }
    for(let o of res.archivedTasks) {
        o.archived = true;
        archivedTasks.push(new Task(o));
    }
    for(let o of res.archivedLists) {
        o.archived = true;
        archivedLists.push(new List(o));
    }
    setupModal();
    setupCalendar();
});

function setupModal() {
    document.getElementById("close").onclick = function() {
        document.getElementById("modal").style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

/* WIP Dark Mode
function getAllCSSVars() {
    return Array.from(document.styleSheets)
        .filter(
            sheet =>
            sheet.href === null || sheet.href.startsWith(window.location.origin)
        )
        .reduce(
            (acc, sheet) =>
            (acc = [
                ...acc,
                ...Array.from(sheet.cssRules).reduce(
                (def, rule) =>
                    (def =
                    rule.selectorText === ":root"
                        ? [
                            ...def,
                            ...Array.from(rule.style).filter(name =>
                            name.startsWith("--DYN")
                            )
                        ]
                        : def),
                []
                )
            ]),
            []
        );
}*/

function setupCalendar(monthOffset = 0) {
    function _getDaysInMonth(dateObj) {
        // month + 1 because Date constructor is 1-based while Date.getMonth is 0-based
        // - 1 at the end because our Day class is 0-based while Date.getDate is 1 based
        return new Date(dateObj.getMonth(), dateObj.getMonth() + 1, 0).getDate() - 1;
    }

    function _createDayCellAt(row, year, month, day, isFiller) {
        let cell = document.createElement("td");
        row.appendChild(cell);
        days.push(new Day(cell, year, month, day, isFiller));
    }

    // SETUP

    let days = [];
    let table = document.getElementById("calendarTable");
    table.innerHTML = ""; // erase any existing data (only useful when user switches between months)

    // Creating month objects for prev, cur, and next months
    let curMonthObj = new Date();
    curMonthObj.setMonth(curMonthObj.getMonth() + monthOffset);
    curMonthObj.setDate(1);
    let dotw = curMonthObj.getDay();
    let year = curMonthObj.getYear();
    let month = curMonthObj.getMonth();
    daysInMonth = _getDaysInMonth(curMonthObj);

    let prevMonth = (month != 0) ? month - 1 : 11;
    let prevMonthObj = new Date();
    prevMonthObj.setMonth(prevMonth);
    let daysInPrevMonth = _getDaysInMonth(prevMonthObj);
    let visibleDaysInPrevMonth = dotw;

    let nextMonth = (month != 11) ? month + 1 : 0;
    let nextMonthObj = new Date();
    nextMonthObj.setDate(nextMonth);
    let daysInNextMonth = _getDaysInMonth(nextMonthObj);
    let visibleDaysInNextMonth = 0;

    // CALENDAR TEMPLATE CREATION

    // Creating month header
    document.getElementById("monthHeader").innerHTML = FULL_MONTH_STRINGS[month];

    // Creating dotw header rows
    let dotwRow = table.insertRow();
    for(let i = 0; i < 7; i++) {
        Form.addTextNodeTo(dotwRow, "td", "dotwHeader", DAY_STRINGS[i]);
    }

    // Creating previous month section (if needed to fill calendar days)
    if(visibleDaysInPrevMonth != 0) {
        let row = table.insertRow();
        for(let i = visibleDaysInPrevMonth - 1; i >= 0; i--) { // adding previous month days to the row
            _createDayCellAt(row, year, prevMonth, daysInPrevMonth - i, true);
        }
        for(let i = 0; i < 7 - visibleDaysInPrevMonth; i++) { // filling in the rest of the row with current month days
            _createDayCellAt(row, year, month, i, false);
        }
    }

    // Creating current month section
    let dayOffset = (visibleDaysInPrevMonth == 0) ? 0 : 7 - visibleDaysInPrevMonth; // if a previous month section was created, an offset is now present
    let numWeeks = (dayOffset == 0) ? 5 : 4; // if a previous month section was created, 1 less week is needed
    for(let i = 0; i < numWeeks; i++) {
        let row = table.insertRow();
        for(let j = 0; j < 7; j++) {
            let dateNum = i * 7 + j + dayOffset;
            if(dateNum <= daysInMonth) {
                _createDayCellAt(row, year, month, dateNum, false);
            } else {
                // Creating next month section once the date number exceeds the total number of days in current month
                visibleDaysInNextMonth = 7 - j; // - 1 since 'i' goes from 0 - 6 instead of 1 - 7
                for(let k = 0; k < 7 - j; k++) {
                    _createDayCellAt(row, year, nextMonth, k, true);
                }
                break;
            }
        }
    }

    // STYLIZING

    let todayI;
    if(monthOffset < 0) { // viewing past month
        todayI = days.length;
    } else if(monthOffset == 0) { // viewing current month -- need to set "Today" date in this case
        // Setting today
        todayI = new Date().getDate() + visibleDaysInPrevMonth - 1;
        days[todayI].setToToday();

        // Setting timeout for next today
        let today = new Date();
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDateObjToDayStart(tomorrow);
        let timeUntilTmrw = tomorrow.getTime() - today.getTime();
        console.log(
            `New day will be set in ` +
            `${Math.floor(timeUntilTmrw / 1000 / 60 / 60)} hours and ` +
            `${Math.floor(timeUntilTmrw / 1000 / 60 % 60)} minutes`
        );

        function _setTodayTimeout() {
            let today = new Date();
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if(yesterday.getMonth() == today.getMonth()) { // if months are different, indicates new month
                days[yesterday.getDate() + visibleDaysInPrevMonth - 1].removeAsToday();
                days[today.getDate() + visibleDaysInPrevMonth - 1].setToToday();
            }
            console.log(yesterday.getDate() + dayOffset - 1, today.getDate() + dayOffset - 1)
            setTimeout(_setTodayTimeout.bind(this), 24 * 60 * 60 * 1000 + 500); // fresh day is garunteed here; +500 to ensure day has changed in JS's Day object
            console.log("New day has been set");
        }
        setTimeout(_setTodayTimeout.bind(this), timeUntilTmrw + 500); // +500 to ensure day has changed in JS's Day object
    } else if(monthOffset > 0) { // viewing future month
        todayI == -1;
    }

    // Setting past days to overdue
    for(let i = 0; i < todayI; i++) {
        days[i].setToOverdue();
    }

    // ADDING TASKS TO CALENDAR

    // This function checks if two date ranges have an overlap
    function _isDateRangeOverlap(s1, e1, s2, e2) { // where all arguments are Date objects
        // convert from Date object to relative int
        s1 = s1.getTime();
        e1 = e1.getTime();
        s2 = s2.getTime();
        e2 = e2.getTime();
        
        // compare ints
        if (s1 <= s2 && s2 <= e1) return true; // b starts in a
        if (s1 <= e2 && e2 <= e1) return true; // b ends in a
        if (s2 <  s1 && e1 <  e2) return true; // a in b
        return false;
    }

    // Creating calendar start and end objefcts so they can be passed to _isDateRangeOverlap
    let calendarStart = new Date();
    if(visibleDaysInPrevMonth != 0) { // there are visible days from the prev month
        calendarStart.setMonth(prevMonth);
        calendarStart.setDate(daysInPrevMonth - visibleDaysInPrevMonth);
    } else { // there are not visible days from the prev month
        calendarStart.setMonth(month);
        calendarStart.setDate(0);
    }

   let calendarEnd = new Date();
    if(visibleDaysInNextMonth != 0) { // there are visible days from the next month
        calendarEnd.setMonth(nextMonth);
        calendarEnd.setDate(visibleDaysInNextMonth);
    } else { // there are not visible days from the next month
        calendarEnd.setMonth(month);
        calendarEnd.setDate(daysInMonth);
    }

    // Looping through all tasks and adding them to the calendar
    for(let t of allTasks) {
        let taskStart = new Date(t.doingStart);
        let taskStartMonth = taskStart.getMonth();
        let taskEnd = new Date(t.doingEnd);
        let taskEndMonth = taskEnd.getMonth();
        if(_isDateRangeOverlap(taskStart, taskEnd, calendarStart, calendarEnd)) { // if the task's start and end overlap with calendar's start and end
            let taskStartDate;
            let taskStartAbsoluteDate = taskStart.getDate();
            if(taskStartMonth == month) // if same months
                taskStartDate = taskStartAbsoluteDate + visibleDaysInPrevMonth; // set to whatever the date is
            else if(taskStartMonth == prevMonth && taskStartAbsoluteDate >= (daysInPrevMonth - visibleDaysInPrevMonth)) // if part of the visible prev month
                taskStartDate = visibleDaysInPrevMonth - 1 - (daysInPrevMonth - taskStartAbsoluteDate); // set date to whatever the date is (in the prev month)
            else if(taskStartMonth == nextMonth && taskStartAbsoluteDate <= visibleDaysInPrevMonth) // if part of the visible next month
                taskStartDate = visibleDaysInPrevMonth + daysInMonth + taskStartAbsoluteDate; // set date to whatever the date is (in the next month)
            else if(taskStartMonth < month) // if it starts any earlier
                taskStartDate = 0; // start from first day in calendar (including prev month if applicable)

            let taskEndDate;
            let taskEndAbsoluteDate = taskEnd.getDate();
            if(taskEndMonth == month)
                taskEndDate = taskEndAbsoluteDate + visibleDaysInPrevMonth;
            else if(taskEndMonth == nextMonth && taskEndAbsoluteDate <= visibleDaysInNextMonth)
                taskEndDate = visibleDaysInPrevMonth + daysInMonth + taskEndAbsoluteDate;
            else if(taskEndMonth == prevMonth && taskEndAbsoluteDate >= (daysInPrevMonth - visibleDaysInPrevMonth))
                taskEndDate = visibleDaysInPrevMonth - 1 - (daysInPrevMonth - taskEndAbsoluteDate);
            else if(taskEndMonth > month)
                taskEndDate = visibleDaysInPrevMonth + daysInMonth + visibleDaysInNextMonth;
            for(let i = taskStartDate; i <= taskEndDate; i++) {
                if(t.dotw[i % 7] && t.active) // dotw and active check
                    days[i].addTask(t);
            }
        }
    }
}

let curMonthOffset = 0;

function changeMonthBtnOnclick(increment) {
    if(new Date().getMonth() + curMonthOffset + increment >= 0) {
        curMonthOffset += increment;
        setupCalendar(curMonthOffset);
    } else
        openModal("Cannot change years");
}

document.getElementById("prevMonthBtn").onclick = function() {
    changeMonthBtnOnclick(-1);
}

document.getElementById("nextMonthBtn").onclick = function() {
    changeMonthBtnOnclick(1);
}

