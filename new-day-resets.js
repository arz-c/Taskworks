// Currently disabled in server.js because realized that this feature may be annoying if a task is done early

const fs = require('fs')

function numericDateToInt(date) {
    date = date.split('-');
    return(
        365 * parseInt(date[0]) +
        30.5 * parseInt(date[1]) +
        parseInt(date[2])
    );
}

function getTodaysNumericDate() {
    let today = new Date();
    return(
        today.getFullYear() + '-' +
        (parseInt(today.getMonth()) + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) + '-' +
        today.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
    );
}

function newDayResets(users, updateDB) {
    if(typeof(users) != 'object' || users.length == 0)
        return false
    for(let user of users) {
        for(let list of user.data.lists) {
            for(let task of list.tasks) {
                // DAILY CHECKBOX RESET
                let todayInt = numericDateToInt(getTodaysNumericDate())
                if(
                    task.active == 'true' && 
                    task.checked == 'true' &&
                    todayInt >= numericDateToInt(task.doingStart) &&
                    todayInt <= numericDateToInt(task.doingEnd) &&
                    task.dotw[new Date().getDay()] == 'true'
                ) {
                        task.checked = 'false'
                        console.log(`Task reset: '${task.title}' from username: ${user.username}`)
                        setTimeout(newDayResets, 24 * 60 * 60 * 1000); // since a fresh day start is garunteed here, set next timeout to 24 hours from now
                }
            }
        }
    }
    updateDB();
}

module.exports = newDayResets