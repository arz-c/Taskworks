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
    setDateObjToDayStart(curMonthObj);
    //curMonthObj.setMonth(curMonthObj.getMonth() + monthOffset);
    for(let i = 0; i < Math.abs(monthOffset); i++) {
        if(monthOffset > 0)
            curMonthObj.setDate(_getDaysInMonth(curMonthObj) + 1 + 1); // first + 1 because 0-based, second to carry over to next month
        else
            curMonthObj.setDate(-1);
    }
    curMonthObj.setDate(1);
    let dotw = curMonthObj.getDay();
    let year = curMonthObj.getYear();
    let month = curMonthObj.getMonth();
    let daysInMonth = _getDaysInMonth(curMonthObj);

    let prevMonthObj = new Date(curMonthObj.getTime());
    prevMonthObj.setMonth(prevMonthObj.getMonth() - 1);
    let prevMonth = prevMonthObj.getMonth();
    let prevMonthYear = prevMonthObj.getYear();
    let daysInPrevMonth = _getDaysInMonth(prevMonthObj);
    let visibleDaysInPrevMonth = dotw;

    let nextMonthObj = new Date(curMonthObj.getTime());
    nextMonthObj.setMonth(nextMonthObj.getMonth() + 1);
    let nextMonth = nextMonthObj.getMonth();
    let nextMonthYear = nextMonthObj.getYear();
    let daysInNextMonth = _getDaysInMonth(nextMonthObj);
    let visibleDaysInNextMonth = 0; // is increased as next month days are filled in

    // CALENDAR TEMPLATE CREATION

    // Creating month header
    document.getElementById("monthHeader").innerHTML = `${FULL_MONTH_STRINGS[month]} ${curMonthObj.getFullYear()}`;

    // Creating dotw header rows
    let dotwRow = table.insertRow();
    for(let i = 0; i < 7; i++) {
        Form.addTextNodeTo(dotwRow, "td", "dotwHeader", DAY_STRINGS[i]);
    }

    // Creating previous month section (if needed to fill calendar days)
    if(visibleDaysInPrevMonth != 0) {
        let row = table.insertRow();
        for(let i = visibleDaysInPrevMonth - 1; i >= 0; i--) { // adding previous month days to the row
            _createDayCellAt(row, prevMonthYear, prevMonth, daysInPrevMonth - i, true);
        }
        for(let i = 0; i < 7 - visibleDaysInPrevMonth; i++) { // filling in the rest of the row with current month days
            _createDayCellAt(row, year, month, i, false);
        }
    }

    // Creating current month section
    let dayOffset = (visibleDaysInPrevMonth == 0) ? 0 : 7 - visibleDaysInPrevMonth; // if a previous month section was created, an offset is now present
    let numWeeks = 6;
    if(dayOffset != 0)
        numWeeks -= 1; // if a previous month section was created, 1 less week is needed
    
    {
        let nextMonthOffset = 0;
        for(let i = 0; i < numWeeks; i++) {
            let row = table.insertRow();
            for(let j = 0; j < 7; j++) {
                let dateNum = i * 7 + j + dayOffset;
                if(dateNum <= daysInMonth) {
                    _createDayCellAt(row, year, month, dateNum, false);
                } else { // Creating next month section once the date number exceeds the total number of days in current month
                    visibleDaysInNextMonth += 7 - j; // - 1 since 'i' goes from 0 - 6 instead of 1 - 7
                    // Create next month section (including 6th row)
                    let k;
                    for(k = 0 + nextMonthOffset; k < 7 - j + nextMonthOffset; k++) {
                        _createDayCellAt(row, nextMonthYear, nextMonth, k, true);
                    }
                    nextMonthOffset = k;
                    break;
                }
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
            // today.setDate(today.getDate() + 1) // for testing
            let yesterday = new Date();
            // yesterday.setDate(yesterday.getDate() + 1)  // for testing
            yesterday.setDate(yesterday.getDate() - 1);
            if(yesterday.getMonth() == today.getMonth()) { // if months are different, indicates new month
                // set new today
                days[yesterday.getDate() + visibleDaysInPrevMonth - 1].removeAsToday();
                // set yesterday's tasks to overdue
                days[today.getDate() + visibleDaysInPrevMonth - 1].setToToday();
                for(let i = 0; i < todayI + 1; i++) { // safe to do + 1 since we know we're still in same month, meaning todayI (yesterday's index) + 1 is still within calendar's limit
                    days[i].setToOverdue();
                }
            }
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
    let calendarStart = new Date(curMonthObj.getTime());
    if(visibleDaysInPrevMonth != 0) { // there are visible days from the prev month
        calendarStart.setYear(prevMonthYear + 1900);
        calendarStart.setMonth(prevMonth);
        calendarStart.setDate(daysInPrevMonth - visibleDaysInPrevMonth);
    } else { // there are not visible days from the prev month
        calendarStart.setYear(year + 1900);
        calendarStart.setMonth(month);
        calendarStart.setDate(0);
    }

   let calendarEnd = new Date(curMonthObj.getTime());
    if(visibleDaysInNextMonth != 0) { // there are visible days from the next month
        calendarEnd.setYear(nextMonthYear + 1900);
        calendarEnd.setMonth(nextMonth);
        calendarEnd.setDate(visibleDaysInNextMonth);
    } else { // there are not visible days from the next month
        calendarEnd.setYear(year + 1900);
        calendarEnd.setMonth(month);
        calendarEnd.setDate(daysInMonth);
    }

    // Looping through all tasks and adding them to the calendar
    for(let t of allTasks) {
        // these tasks don't need to be normalized (date + 1) because later in the code, it is expecting the date to be - 1 (i.e., Jan 1st = Jan 0th according to code)
        let taskStart = new Date(t.doingStart);
        let taskEnd = (!t.optionals.doingEnd) ? taskStart : new Date(t.doingEnd); // task end is an optional property
        
        if(_isDateRangeOverlap(taskStart, taskEnd, calendarStart, calendarEnd)) { // if the task's start and end overlap with calendar's start and end
            let taskStartYear = taskStart.getYear();
            let taskStartMonth = taskStart.getMonth();

            let taskEndYear = taskEnd.getYear();
            let taskEndMonth = taskEnd.getMonth();

            let taskStartDate;
            let taskStartAbsoluteDate = taskStart.getDate();
            if(taskStartYear == year && taskStartMonth == month) // if same months
                taskStartDate = taskStartAbsoluteDate + visibleDaysInPrevMonth;
            else if(taskStartYear == prevMonthYear && taskStartMonth == prevMonth && taskStartAbsoluteDate >= (daysInPrevMonth - visibleDaysInPrevMonth)) // if part of the visible prev month
                taskStartDate = visibleDaysInPrevMonth - 1 - (daysInPrevMonth - taskStartAbsoluteDate)
            else if(taskStartYear == nextMonthYear && taskStartMonth == nextMonth && taskStartAbsoluteDate <= visibleDaysInNextMonth) // if part of the visible next month
                taskStartDate = visibleDaysInPrevMonth + daysInMonth + 1 + taskStartAbsoluteDate;
            else if(taskStartMonth < month || taskStartYear < year) // if it starts any earlier
                taskStartDate = 0;

            let taskEndDate;
            let taskEndAbsoluteDate = taskEnd.getDate();
            if(taskEndYear == year && taskEndMonth == month)
                taskEndDate = taskEndAbsoluteDate + visibleDaysInPrevMonth;
            else if(taskEndYear == prevMonthYear && taskEndMonth == prevMonth && taskEndAbsoluteDate >= (daysInPrevMonth - visibleDaysInPrevMonth))
                taskEndDate = visibleDaysInPrevMonth - 1 - (daysInPrevMonth - taskEndAbsoluteDate);
            else if(taskEndYear == nextMonthYear && taskEndMonth == nextMonth && taskEndAbsoluteDate <= visibleDaysInNextMonth)
                taskEndDate = visibleDaysInPrevMonth + daysInMonth + 1 + taskEndAbsoluteDate; // unsure about the + 1, but it seems to be correct
            else if(taskEndMonth > month || taskEndYear > year)
                taskEndDate = visibleDaysInPrevMonth + daysInMonth + visibleDaysInNextMonth;
            
            let curDate
            if(visibleDaysInPrevMonth != 0) {
                curDate = new Date(prevMonthObj.getTime());
                curDate.setDate((daysInPrevMonth + 1) - (visibleDaysInPrevMonth - 1));
            } else {
                curDate = new Date(curMonthObj.getTime());
            }
            curDate.setDate(curDate.getDate() + taskStartDate); // offset
            let dueDate;
            let upcomingDate;
            if(t.optionals.due) {
                dueDate = new Date(t.due);
                dueDate.setDate(dueDate.getDate() + 1); // normalize
                setDateObjToDayStart(dueDate);
                upcomingDate = new Date(dueDate.getTime());
                upcomingDate.setDate(upcomingDate.getDate() - 1);
            } else {
                dueDate = null;
                upcomingDate = null;
            }

            for(let i = taskStartDate; i <= taskEndDate; i++) {
                let day = days[i];
                if(t.dotw[i % 7] && t.active) {// dotw and active check
                    day.addTask(t);
                    if(dueDate != null) {
                        if(curDate.getTime() == upcomingDate.getTime())
                            t.setToApproaching(day.id, 0)
                        else if(curDate.getTime() >= dueDate.getTime())
                            t.setToApproaching(day.id, 1)
                    }
                }
                curDate.setDate(curDate.getDate() + 1);
            }
        }
    }
}

let curMonthOffset = 0;

function changeMonthBtnOnclick(increment) {
    curMonthOffset += increment;
    setupCalendar(curMonthOffset);
}

document.getElementById("prevMonthBtn").onclick = function() {
    changeMonthBtnOnclick(-1);
}

document.getElementById("nextMonthBtn").onclick = function() {
    changeMonthBtnOnclick(1);
}

