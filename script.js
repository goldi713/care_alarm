/* ========================================
   CareAlarm JavaScript
   ======================================== */


/* STORE ALL ALARMS */

let alarms = [];


/* ========================================
   SHOW ALARM BOX
   ======================================== */

function showAlarmBox() {

    document.getElementById("alarmBox").style.display = "block";

}


/* ========================================
   SAVE NEW ALARM
   ======================================== */

function saveAlarm() {

    const time =
        document.getElementById("alarmTime").value;

    const name =
        document.getElementById("alarmName").value;


    /* CHECK TIME */

    if (time === "") {

        alert("⏰ Please select a time!");

        return;
    }


    /* CREATE ALARM */

    const alarm = {

        time: time,

        name: name || "Alarm"

    };


    /* ADD TO ARRAY */

    alarms.push(alarm);


    /* SHOW ALARMS */

    displayAlarms();


    /* CLEAR INPUTS */

    document.getElementById("alarmTime").value = "";

    document.getElementById("alarmName").value = "";


    /* CLOSE BOX */

    document.getElementById("alarmBox").style.display = "none";

}


/* ========================================
   DISPLAY ALL ALARMS
   ======================================== */

function displayAlarms() {

    const alarmList =
        document.getElementById("alarmList");


    /* CLEAR OLD LIST */

    alarmList.innerHTML = "";


    /* CREATE EACH ALARM */

    alarms.forEach(function (alarm, index) {


        const alarmItem =
            document.createElement("div");


        alarmItem.className = "alarm-item";


        alarmItem.innerHTML = `

            <div>

                <strong>
                    ⏰ ${formatTime(alarm.time)}
                </strong>

                <br>

                <span>
                    ${alarm.name}
                </span>

            </div>

            <button
                onclick="deleteAlarm(${index})">
                Delete
            </button>

        `;


        alarmList.appendChild(alarmItem);

    });

}


/* ========================================
   FORMAT TIME
   ======================================== */

function formatTime(time) {

    const parts = time.split(":");

    let hour = parseInt(parts[0]);

    const minute = parts[1];

    const period = hour >= 12 ? "PM" : "AM";


    hour = hour % 12;

    if (hour === 0) {

        hour = 12;

    }


    return hour + ":" + minute + " " + period;

}


/* ========================================
   DELETE ALARM
   ======================================== */

function deleteAlarm(index) {

    alarms.splice(index, 1);

    displayAlarms();

}


/* ========================================
   MEDICINE REMINDER
   ======================================== */

function setMedicineReminder() {

    alert("💊 Medicine Reminder feature coming next!");

}


/* ========================================
   EMERGENCY ALERT
   ======================================== */

function emergencyAlert() {

    const confirmEmergency =
        confirm(
            "🚨 Are you sure you need emergency help?"
        );


    if (confirmEmergency) {

        alert(
            "🚨 Emergency Alert activated!"
        );

    }

}