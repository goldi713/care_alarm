"use strict";

/* =========================================================
   CAREALARM - COMPLETE SCRIPT
   Only button functionality fixed:
   Edit / Call / WhatsApp / Delete
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const CONTACTS_KEY = "careAlarmContacts";
const REMINDERS_KEY = "careAlarmReminders";

let contacts =
    JSON.parse(localStorage.getItem(CONTACTS_KEY)) || [];

let reminders =
    JSON.parse(localStorage.getItem(REMINDERS_KEY)) || [];

let editingReminderId = null;
let currentAlarmReminder = null;

let alarmTimeout = null;
let alarmSoundInterval = null;
let audioContext = null;


/* =========================================================
   DAYS
   ========================================================= */

const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const typeIcons = {
    water: "💧",
    walk: "🚶",
    sleep: "🌙",
    medicine: "💊"
};


/* =========================================================
   ELEMENTS
   ========================================================= */

const currentDay =
    document.getElementById("currentDay");

const currentTime =
    document.getElementById("currentTime");

const currentDate =
    document.getElementById("currentDate");


/* Emergency */

const emergencyContact =
    document.getElementById("emergencyContact");

const callEmergencyBtn =
    document.getElementById("callEmergencyBtn");

const whatsappEmergencyBtn =
    document.getElementById("whatsappEmergencyBtn");

const emergencyStatus =
    document.getElementById("emergencyStatus");


/* Contacts */

const contactName =
    document.getElementById("contactName");

const contactPhone =
    document.getElementById("contactPhone");

const saveContactBtn =
    document.getElementById("saveContactBtn");

const contactStatus =
    document.getElementById("contactStatus");

const contactsList =
    document.getElementById("contactsList");


/* Reminder */

const reminderType =
    document.getElementById("reminderType");

const reminderTitle =
    document.getElementById("reminderTitle");

const medicineNameBox =
    document.getElementById("medicineNameBox");

const medicineName =
    document.getElementById("medicineName");

const reminderTime =
    document.getElementById("reminderTime");

const dayCheckboxes =
    document.querySelectorAll(".day-checkbox");

const dailyBtn =
    document.getElementById("dailyBtn");

const clearDaysBtn =
    document.getElementById("clearDaysBtn");

const daysStatus =
    document.getElementById("daysStatus");

const saveReminderBtn =
    document.getElementById("saveReminderBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const reminderStatus =
    document.getElementById("reminderStatus");


/* Lists */

const todayReminders =
    document.getElementById("todayReminders");

const allReminders =
    document.getElementById("allReminders");


/* Alarm popup */

const alarmOverlay =
    document.getElementById("alarmOverlay");

const alarmTitle =
    document.getElementById("alarmTitle");

const alarmMessage =
    document.getElementById("alarmMessage");

const alarmEditBtn =
    document.getElementById("alarmEditBtn");

const alarmCallBtn =
    document.getElementById("alarmCallBtn");

const alarmWhatsappBtn =
    document.getElementById("alarmWhatsappBtn");

const alarmStopBtn =
    document.getElementById("alarmStopBtn");

const alarmSnoozeBtn =
    document.getElementById("alarmSnoozeBtn");

const testNotificationBtn =
    document.getElementById("testNotificationBtn");


/* =========================================================
   STORAGE
   ========================================================= */

function saveContacts() {
    localStorage.setItem(
        CONTACTS_KEY,
        JSON.stringify(contacts)
    );
}


function saveReminders() {
    localStorage.setItem(
        REMINDERS_KEY,
        JSON.stringify(reminders)
    );
}


function createId() {
    return (
        Date.now().toString() +
        Math.random().toString(16).slice(2)
    );
}


/* =========================================================
   PHONE
   ========================================================= */

function normalizePhone(phone) {

    let cleaned =
        String(phone).replace(/\D/g, "");

    /*
     * If number is already 91XXXXXXXXXX,
     * keep it unchanged.
     */

    if (
        cleaned.length === 10
    ) {
        cleaned = "91" + cleaned;
    }

    return cleaned;
}


/* =========================================================
   STATUS
   ========================================================= */

function showStatus(element, message) {

    if (!element) {
        return;
    }

    element.textContent = message;

    setTimeout(() => {

        if (
            element.textContent === message
        ) {
            element.textContent = "";
        }

    }, 4000);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClock() {

    const now = new Date();

    currentDay.textContent =
        dayNames[now.getDay()];

    currentTime.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );

    currentDate.textContent =
        now.toLocaleDateString(
            [],
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
}


updateClock();

setInterval(
    updateClock,
    1000
);


/* =========================================================
   DAYS
   ========================================================= */

function getSelectedDays() {

    return Array.from(dayCheckboxes)
        .filter(
            checkbox =>
                checkbox.checked
        )
        .map(
            checkbox =>
                Number(checkbox.value)
        );
}


function setSelectedDays(days) {

    dayCheckboxes.forEach(
        checkbox => {

            checkbox.checked =
                days.includes(
                    Number(checkbox.value)
                );
        }
    );

    updateDaysStatus();
}


function updateDaysStatus() {

    const days =
        getSelectedDays();

    if (days.length === 0) {

        daysStatus.textContent =
            "Please select at least one day.";

        return;
    }

    if (days.length === 7) {

        daysStatus.textContent =
            "📅 Daily selected.";

        return;
    }

    daysStatus.textContent =
        "Selected: " +
        days
            .map(day => dayNames[day])
            .join(", ");
}


dayCheckboxes.forEach(
    checkbox => {

        checkbox.addEventListener(
            "change",
            updateDaysStatus
        );
    }
);


dailyBtn.addEventListener(
    "click",
    () => {

        dayCheckboxes.forEach(
            checkbox => {
                checkbox.checked = true;
            }
        );

        updateDaysStatus();
    }
);


clearDaysBtn.addEventListener(
    "click",
    () => {

        dayCheckboxes.forEach(
            checkbox => {
                checkbox.checked = false;
            }
        );

        updateDaysStatus();
    }
);


updateDaysStatus();


/* =========================================================
   CONTACTS
   ========================================================= */

function getContact(id) {

    return contacts.find(
        contact =>
            String(contact.id) === String(id)
    );
}


/* =========================================================
   RENDER CONTACTS
   ========================================================= */

function renderContacts() {

    contactsList.innerHTML = "";

    emergencyContact.innerHTML = `
        <option value="">
            -- Select Contact --
        </option>
    `;


    if (contacts.length === 0) {

        contactsList.innerHTML = `
            <div class="empty-message">
                No family contacts saved yet.
            </div>
        `;

        return;
    }


    contacts.forEach(
        contact => {

            /*
             * Emergency dropdown
             */

            const option =
                document.createElement("option");

            option.value =
                contact.id;

            option.textContent =
                `${contact.name} - ${contact.phone}`;

            emergencyContact.appendChild(
                option
            );


            /*
             * Contact card
             */

            const item =
                document.createElement("div");

            item.className =
                "contact-item";


            item.innerHTML = `

                <div class="contact-header">

                    <div>

                        <div class="contact-name">

                            ${escapeHtml(
                                contact.name
                            )}

                        </div>

                        <div class="phone-number">

                            📞 ${escapeHtml(
                                contact.phone
                            )}

                        </div>

                    </div>

                </div>


                <div class="contact-actions">

                    <button
                        type="button"
                        class="call-btn contact-call-btn">

                        📞 Call

                    </button>


                    <button
                        type="button"
                        class="wa-btn contact-whatsapp-btn">

                        💬 WhatsApp

                    </button>


                    <button
                        type="button"
                        class="delete-btn contact-delete-btn">

                        🗑️ Delete

                    </button>

                </div>
            `;


            /*
             * IMPORTANT:
             * Attach buttons directly.
             * No inline onclick.
             */

            const callBtn =
                item.querySelector(
                    ".contact-call-btn"
                );

            const whatsappBtn =
                item.querySelector(
                    ".contact-whatsapp-btn"
                );

            const deleteBtn =
                item.querySelector(
                    ".contact-delete-btn"
                );


            callBtn.addEventListener(
                "click",
                () => {

                    callContact(
                        contact.id
                    );
                }
            );


            whatsappBtn.addEventListener(
                "click",
                () => {

                    whatsappContact(
                        contact.id
                    );
                }
            );


            deleteBtn.addEventListener(
                "click",
                () => {

                    deleteContact(
                        contact.id
                    );
                }
            );


            contactsList.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   SAVE CONTACT
   ========================================================= */

saveContactBtn.addEventListener(
    "click",
    () => {

        const name =
            contactName.value.trim();

        const phone =
            contactPhone.value.trim();


        if (!name) {

            showStatus(
                contactStatus,
                "Please enter contact name."
            );

            return;
        }


        if (!phone) {

            showStatus(
                contactStatus,
                "Please enter phone number."
            );

            return;
        }


        const normalized =
            normalizePhone(phone);


        if (
            normalized.length < 10
        ) {

            showStatus(
                contactStatus,
                "Please enter a valid phone number."
            );

            return;
        }


        contacts.push({

            id: createId(),

            name: name,

            phone: normalized

        });


        saveContacts();

        renderContacts();


        contactName.value = "";

        contactPhone.value = "";


        showStatus(
            contactStatus,
            "✅ Contact saved successfully."
        );
    }
);


/* =========================================================
   CONTACT CALL
   ========================================================= */

function callContact(id) {

    const contact =
        getContact(id);

    if (!contact) {

        alert(
            "Contact not found."
        );

        return;
    }


    const phone =
        normalizePhone(
            contact.phone
        );


    if (!phone) {

        alert(
            "Invalid phone number."
        );

        return;
    }


    /*
     * Mobile/desktop phone handler
     */

    window.location.href =
        "tel:+" + phone;
}


/* =========================================================
   CONTACT WHATSAPP
   ========================================================= */

function whatsappContact(id) {

    const contact =
        getContact(id);

    if (!contact) {

        alert(
            "Contact not found."
        );

        return;
    }


    const phone =
        normalizePhone(
            contact.phone
        );


    if (!phone) {

        alert(
            "Invalid phone number."
        );

        return;
    }


    const message =
        `Hello ${contact.name}, this is a message from CareAlarm.`;


    openWhatsApp(
        phone,
        message
    );
}


/* =========================================================
   CONTACT DELETE
   ========================================================= */

function deleteContact(id) {

    const contact =
        getContact(id);

    if (!contact) {

        alert(
            "Contact not found."
        );

        return;
    }


    const confirmDelete =
        confirm(
            `Delete ${contact.name} from family contacts?`
        );


    if (!confirmDelete) {
        return;
    }


    contacts =
        contacts.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveContacts();

    renderContacts();


    showStatus(
        contactStatus,
        "✅ Contact deleted."
    );
}


/* =========================================================
   WHATSAPP OPEN
   ========================================================= */

function openWhatsApp(
    phone,
    message
) {

    const url =
        "https://wa.me/" +
        phone +
        "?text=" +
        encodeURIComponent(message);


    /*
     * Use location instead of popup
     * so browser popup blocking does
     * not stop WhatsApp.
     */

    window.location.href = url;
}


/* =========================================================
   EMERGENCY CALL
   ========================================================= */

callEmergencyBtn.addEventListener(
    "click",
    () => {

        const id =
            emergencyContact.value;


        if (!id) {

            showStatus(
                emergencyStatus,
                "⚠️ Please select an emergency contact first."
            );

            return;
        }


        const contact =
            getContact(id);


        if (!contact) {
            return;
        }


        showStatus(
            emergencyStatus,
            `📞 Calling ${contact.name}...`
        );


        callContact(
            contact.id
        );
    }
);


/* =========================================================
   EMERGENCY WHATSAPP
   ========================================================= */

whatsappEmergencyBtn.addEventListener(
    "click",
    () => {

        const id =
            emergencyContact.value;


        if (!id) {

            showStatus(
                emergencyStatus,
                "⚠️ Please select an emergency contact first."
            );

            return;
        }


        const contact =
            getContact(id);


        if (!contact) {
            return;
        }


        const message =
            "🆘 EMERGENCY ALERT from CareAlarm!\n\n" +
            "Please contact me as soon as possible.";


        showStatus(
            emergencyStatus,
            `💬 Opening WhatsApp for ${contact.name}...`
        );


        openWhatsApp(
            normalizePhone(
                contact.phone
            ),
            message
        );
    }
);


/* =========================================================
   REMINDER TYPE
   ========================================================= */

reminderType.addEventListener(
    "change",
    () => {

        if (
            reminderType.value ===
            "medicine"
        ) {

            medicineNameBox.classList.remove(
                "hidden"
            );


            if (
                !reminderTitle.value.trim()
            ) {

                reminderTitle.value =
                    "Medicine";
            }

        } else {

            medicineNameBox.classList.add(
                "hidden"
            );
        }
    }
);


/* =========================================================
   SAVE REMINDER
   ========================================================= */

saveReminderBtn.addEventListener(
    "click",
    () => {

        const type =
            reminderType.value;

        const title =
            reminderTitle.value.trim();

        const time =
            reminderTime.value;

        const days =
            getSelectedDays();


        if (!title) {

            showStatus(
                reminderStatus,
                "Please enter reminder name."
            );

            return;
        }


        if (!time) {

            showStatus(
                reminderStatus,
                "Please select reminder time."
            );

            return;
        }


        if (days.length === 0) {

            showStatus(
                reminderStatus,
                "⚠️ Please select at least one day."
            );

            return;
        }


        let medicine = "";


        if (
            type === "medicine"
        ) {

            medicine =
                medicineName.value.trim();


            if (!medicine) {

                showStatus(
                    reminderStatus,
                    "Please enter medicine name."
                );

                return;
            }
        }


        /*
         * UPDATE EXISTING
         */

        if (editingReminderId) {

            const reminder =
                reminders.find(
                    item =>
                        String(item.id) ===
                        String(editingReminderId)
                );


            if (reminder) {

                reminder.type =
                    type;

                reminder.title =
                    title;

                reminder.time =
                    time;

                reminder.days =
                    days;

                reminder.medicine =
                    medicine;

                reminder.enabled =
                    true;
            }


            showStatus(
                reminderStatus,
                "✅ Reminder updated."
            );


        } else {

            /*
             * NEW REMINDER
             */

            reminders.push({

                id: createId(),

                type: type,

                title: title,

                medicine: medicine,

                time: time,

                days: days,

                enabled: true,

                lastTriggered: null

            });


            showStatus(
                reminderStatus,
                "✅ Reminder saved."
            );
        }


        saveReminders();

        resetReminderForm();

        renderReminders();
    }
);


/* =========================================================
   EDIT REMINDER
   ========================================================= */

function editReminder(id) {

    const reminder =
        reminders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!reminder) {

        alert(
            "Reminder not found."
        );

        return;
    }


    editingReminderId =
        reminder.id;


    reminderType.value =
        reminder.type;


    reminderTitle.value =
        reminder.title;


    reminderTime.value =
        reminder.time;


    medicineName.value =
        reminder.medicine || "";


    if (
        reminder.type ===
        "medicine"
    ) {

        medicineNameBox.classList.remove(
            "hidden"
        );

    } else {

        medicineNameBox.classList.add(
            "hidden"
        );
    }


    setSelectedDays(
        reminder.days || []
    );


    saveReminderBtn.textContent =
        "💾 Update Reminder";


    cancelEditBtn.classList.remove(
        "hidden"
    );


    document
        .getElementById("reminderType")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}


/* =========================================================
   CANCEL EDIT
   ========================================================= */

cancelEditBtn.addEventListener(
    "click",
    () => {

        resetReminderForm();

        showStatus(
            reminderStatus,
            "Edit cancelled."
        );
    }
);


/* =========================================================
   RESET REMINDER FORM
   ========================================================= */

function resetReminderForm() {

    editingReminderId =
        null;


    reminderType.value =
        "water";


    reminderTitle.value =
        "";


    medicineName.value =
        "";


    reminderTime.value =
        "";


    medicineNameBox.classList.add(
        "hidden"
    );


    dayCheckboxes.forEach(
        checkbox => {

            checkbox.checked =
                false;
        }
    );


    saveReminderBtn.textContent =
        "➕ Save Reminder";


    cancelEditBtn.classList.add(
        "hidden"
    );


    updateDaysStatus();
}


/* =========================================================
   TOGGLE REMINDER
   ========================================================= */

function toggleReminder(id) {

    const reminder =
        reminders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!reminder) {
        return;
    }


    reminder.enabled =
        !reminder.enabled;


    saveReminders();

    renderReminders();
}


/* =========================================================
   DELETE REMINDER
   ========================================================= */

function deleteReminder(id) {

    const reminder =
        reminders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!reminder) {
        return;
    }


    if (
        !confirm(
            `Delete "${reminder.title}" reminder?`
        )
    ) {

        return;
    }


    reminders =
        reminders.filter(
            item =>
                String(item.id) !==
                String(id)
        );


    saveReminders();

    renderReminders();
}


/* =========================================================
   RENDER REMINDERS
   ========================================================= */

function renderReminders() {

    renderTodayReminders();

    renderAllReminders();
}


/* =========================================================
   TODAY REMINDERS
   ========================================================= */

function renderTodayReminders() {

    todayReminders.innerHTML =
        "";


    const today =
        new Date().getDay();


    const list =
        reminders
            .filter(
                reminder =>
                    reminder.days.includes(
                        today
                    )
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
            );


    if (list.length === 0) {

        todayReminders.innerHTML = `
            <div class="empty-message">
                No reminders for today.
            </div>
        `;

        return;
    }


    list.forEach(
        reminder => {

            todayReminders.appendChild(
                createReminderElement(
                    reminder
                )
            );
        }
    );
}


/* =========================================================
   ALL REMINDERS
   ========================================================= */

function renderAllReminders() {

    allReminders.innerHTML =
        "";


    if (reminders.length === 0) {

        allReminders.innerHTML = `
            <div class="empty-message">
                No reminders saved yet.
            </div>
        `;

        return;
    }


    const list =
        [...reminders].sort(
            (a, b) =>
                a.time.localeCompare(
                    b.time
                )
        );


    list.forEach(
        reminder => {

            allReminders.appendChild(
                createReminderElement(
                    reminder
                )
            );
        }
    );
}


/* =========================================================
   CREATE REMINDER ELEMENT
   ========================================================= */

function createReminderElement(
    reminder
) {

    const item =
        document.createElement("div");


    item.className =
        "reminder-item";


    const formattedTime =
        formatTime(
            reminder.time
        );


    const daysText =
        reminder.days.length === 7
            ? "Daily"
            : reminder.days
                .map(
                    day =>
                        dayNames[day]
                )
                .join(", ");


    let medicineText = "";


    if (
        reminder.type ===
        "medicine" &&
        reminder.medicine
    ) {

        medicineText = `
            <div>
                💊 Medicine:
                ${escapeHtml(
                    reminder.medicine
                )}
            </div>
        `;
    }


    const status =
        reminder.enabled
            ? "🟢 Active"
            : "🔴 Stopped";


    const toggleText =
        reminder.enabled
            ? "⏹️ Stop"
            : "▶️ Start";


    /*
     * IMPORTANT:
     * No inline onclick here.
     */

    item.innerHTML = `

        <div class="reminder-header">

            <div>

                <div class="reminder-title">

                    ${
                        typeIcons[
                            reminder.type
                        ] || "🔔"
                    }

                    ${
                        escapeHtml(
                            reminder.title
                        )
                    }

                </div>


                <div class="reminder-time">

                    ${formattedTime}

                </div>

            </div>


            <div>

                ${status}

            </div>

        </div>


        <div class="reminder-info">

            <div>
                📅 ${escapeHtml(daysText)}
            </div>

            ${medicineText}

        </div>


        <div class="reminder-actions">

            <button
                type="button"
                class="edit-btn reminder-edit-btn">

                ✏️ Edit

            </button>


            <button
                type="button"
                class="stop-btn reminder-stop-btn">

                ${toggleText}

            </button>


            <button
                type="button"
                class="delete-btn reminder-delete-btn">

                🗑️ Delete

            </button>

        </div>
    `;


    /*
     * Attach Edit
     */

    const editBtn =
        item.querySelector(
            ".reminder-edit-btn"
        );


    editBtn.addEventListener(
        "click",
        () => {

            editReminder(
                reminder.id
            );
        }
    );


    /*
     * Attach Stop / Start
     */

    const stopBtn =
        item.querySelector(
            ".reminder-stop-btn"
        );


    stopBtn.addEventListener(
        "click",
        () => {

            toggleReminder(
                reminder.id
            );
        }
    );


    /*
     * Attach Delete
     */

    const deleteBtn =
        item.querySelector(
            ".reminder-delete-btn"
        );


    deleteBtn.addEventListener(
        "click",
        () => {

            deleteReminder(
                reminder.id
            );
        }
    );


    return item;
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(time) {

    if (!time) {
        return "";
    }


    const parts =
        time.split(":");


    let hour =
        Number(parts[0]);


    const minute =
        parts[1];


    const ampm =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {
        hour = 12;
    }


    return `${hour}:${minute} ${ampm}`;
}


/* =========================================================
   CHECK REMINDERS
   ========================================================= */

function checkReminders() {

    const now =
        new Date();


    const today =
        now.getDay();


    const hour =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minute =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    const currentTime =
        `${hour}:${minute}`;


    reminders.forEach(
        reminder => {

            if (!reminder.enabled) {
                return;
            }


            if (
                !reminder.days.includes(
                    today
                )
            ) {
                return;
            }


            if (
                reminder.time !==
                currentTime
            ) {
                return;
            }


            const triggerKey =
                `${now.getFullYear()}-` +
                `${now.getMonth()}-` +
                `${now.getDate()}-` +
                `${reminder.id}-` +
                `${currentTime}`;


            if (
                reminder.lastTriggered ===
                triggerKey
            ) {
                return;
            }


            reminder.lastTriggered =
                triggerKey;


            saveReminders();


            activateAlarm(
                reminder
            );
        }
    );
}


setInterval(
    checkReminders,
    1000
);


/* =========================================================
   VOICE MESSAGE
   ========================================================= */

function getSpokenMessage(
    reminder
) {

    switch (
        reminder.type
    ) {

        case "medicine":

            if (reminder.medicine) {

                return (
                    "CareAlarm reminder. " +
                    "It is time to take " +
                    reminder.medicine +
                    "."
                );
            }

            return (
                "CareAlarm reminder. " +
                "It is time to take your medicine."
            );


        case "water":

            return (
                "CareAlarm reminder. " +
                "Please drink some water."
            );


        case "walk":

            return (
                "CareAlarm reminder. " +
                "It is time for your walk."
            );


        case "sleep":

            return (
                "CareAlarm reminder. " +
                "It is time to sleep."
            );


        default:

            return (
                "CareAlarm reminder. " +
                reminder.title +
                "."
            );
    }
}


/* =========================================================
   ACTIVATE ALARM
   ========================================================= */

function activateAlarm(
    reminder
) {

    currentAlarmReminder =
        reminder;


    const spokenMessage =
        getSpokenMessage(
            reminder
        );


    alarmTitle.textContent =
        `${
            typeIcons[
                reminder.type
            ] || "🔔"
        } ${reminder.title}`;


    alarmMessage.textContent =
        spokenMessage;


    alarmOverlay.classList.remove(
        "hidden"
    );


    startAlarmSound();

    speakAlarmMessage(
        spokenMessage
    );


    sendBrowserNotification(
        reminder.title,
        spokenMessage
    );
}


/* =========================================================
   VOICE
   ========================================================= */

function speakAlarmMessage(
    message
) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            message
        );


    speech.lang = "en-IN";

    speech.rate = 0.85;

    speech.pitch = 1;

    speech.volume = 1;


    const voices =
        window.speechSynthesis
            .getVoices();


    const preferredVoice =
        voices.find(
            voice =>
                voice.lang === "en-IN"
        ) ||
        voices.find(
            voice =>
                voice.lang.startsWith("en")
        );


    if (preferredVoice) {
        speech.voice =
            preferredVoice;
    }


    window.speechSynthesis.speak(
        speech
    );
}


/* =========================================================
   STOP VOICE
   ========================================================= */

function stopVoice() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }
}


/* =========================================================
   SOFT ALARM SOUND
   ========================================================= */

function startAlarmSound() {

    stopAlarmSound();


    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();
        }


        playSoftChime();


        alarmSoundInterval =
            setInterval(
                playSoftChime,
                4000
            );


    } catch (error) {

        console.log(
            "Soft alarm sound error:",
            error
        );
    }
}


/* =========================================================
   SOFT CHIME
   ========================================================= */

function playSoftChime() {

    if (!audioContext) {
        return;
    }


    try {

        const now =
            audioContext.currentTime;


        const oscillator1 =
            audioContext.createOscillator();


        const gain1 =
            audioContext.createGain();


        oscillator1.type =
            "sine";


        oscillator1.frequency.setValueAtTime(
            523.25,
            now
        );


        gain1.gain.setValueAtTime(
            0,
            now
        );


        gain1.gain.linearRampToValueAtTime(
            0.12,
            now + 0.08
        );


        gain1.gain.linearRampToValueAtTime(
            0,
            now + 0.8
        );


        oscillator1.connect(gain1);

        gain1.connect(
            audioContext.destination
        );


        oscillator1.start(now);

        oscillator1.stop(
            now + 0.8
        );


        const oscillator2 =
            audioContext.createOscillator();


        const gain2 =
            audioContext.createGain();


        oscillator2.type =
            "sine";


        oscillator2.frequency.setValueAtTime(
            659.25,
            now + 0.25
        );


        gain2.gain.setValueAtTime(
            0,
            now
        );


        gain2.gain.setValueAtTime(
            0,
            now + 0.25
        );


        gain2.gain.linearRampToValueAtTime(
            0.10,
            now + 0.33
        );


        gain2.gain.linearRampToValueAtTime(
            0,
            now + 1.05
        );


        oscillator2.connect(gain2);

        gain2.connect(
            audioContext.destination
        );


        oscillator2.start(
            now + 0.25
        );

        oscillator2.stop(
            now + 1.05
        );


    } catch (error) {

        console.log(
            "Soft chime error:",
            error
        );
    }
}


/* =========================================================
   STOP SOUND
   ========================================================= */

function stopAlarmSound() {

    if (alarmSoundInterval) {

        clearInterval(
            alarmSoundInterval
        );

        alarmSoundInterval = null;
    }


    if (audioContext) {

        audioContext.close()
            .catch(
                () => {}
            );

        audioContext = null;
    }
}


/* =========================================================
   STOP ALARM
   ========================================================= */

alarmStopBtn.addEventListener(
    "click",
    () => {

        stopAlarm();
    }
);


function stopAlarm() {

    alarmOverlay.classList.add(
        "hidden"
    );


    stopAlarmSound();

    stopVoice();


    currentAlarmReminder =
        null;


    if (alarmTimeout) {

        clearTimeout(
            alarmTimeout
        );

        alarmTimeout = null;
    }
}


/* =========================================================
   SNOOZE
   ========================================================= */

alarmSnoozeBtn.addEventListener(
    "click",
    () => {

        if (!currentAlarmReminder) {
            return;
        }


        const reminder =
            currentAlarmReminder;


        stopAlarm();


        alarmTimeout =
            setTimeout(
                () => {

                    activateAlarm(
                        reminder
                    );

                },
                5 * 60 * 1000
            );
    }
);


/* =========================================================
   ALARM POPUP - EDIT
   ========================================================= */

alarmEditBtn.addEventListener(
    "click",
    () => {

        if (!currentAlarmReminder) {
            return;
        }


        const reminder =
            currentAlarmReminder;


        stopAlarm();


        editReminder(
            reminder.id
        );
    }
);


/* =========================================================
   ALARM POPUP - CALL
   ========================================================= */

alarmCallBtn.addEventListener(
    "click",
    () => {

        const id =
            emergencyContact.value;


        if (!id) {

            alert(
                "Please select an Emergency Contact first."
            );

            return;
        }


        const contact =
            getContact(id);


        if (!contact) {

            alert(
                "Selected contact was not found."
            );

            return;
        }


        callContact(
            contact.id
        );
    }
);


/* =========================================================
   ALARM POPUP - WHATSAPP
   ========================================================= */

alarmWhatsappBtn.addEventListener(
    "click",
    () => {

        const id =
            emergencyContact.value;


        if (!id) {

            alert(
                "Please select an Emergency Contact first."
            );

            return;
        }


        const contact =
            getContact(id);


        if (!contact) {

            alert(
                "Selected contact was not found."
            );

            return;
        }


        let message =
            "🔔 CareAlarm Reminder\n\n" +
            "A reminder is active.";


        if (currentAlarmReminder) {

            message =
                "🔔 CareAlarm Reminder\n\n" +
                "Reminder: " +
                currentAlarmReminder.title;


            if (
                currentAlarmReminder.type ===
                "medicine" &&
                currentAlarmReminder.medicine
            ) {

                message +=
                    "\nMedicine: " +
                    currentAlarmReminder.medicine;
            }


            message +=
                "\n\nPlease check on me.";
        }


        openWhatsApp(
            normalizePhone(
                contact.phone
            ),
            message
        );
    }
);


/* =========================================================
   NOTIFICATION
   ========================================================= */

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission ===
        "default"
    ) {

        try {

            await Notification.requestPermission();

        } catch (error) {

            console.log(error);
        }
    }
}


function sendBrowserNotification(
    title,
    message
) {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission !==
        "granted"
    ) {
        return;
    }


    try {

        new Notification(
            "CareAlarm: " + title,
            {
                body: message
            }
        );

    } catch (error) {

        console.log(error);
    }
}


/* =========================================================
   TEST ALERT
   ========================================================= */

if (testNotificationBtn) {

    testNotificationBtn.addEventListener(
        "click",
        async () => {

            await requestNotificationPermission();


            const testReminder = {

                id: "test-reminder",

                type: "water",

                title: "Test Reminder",

                medicine: "",

                time: "",

                days: [],

                enabled: true

            };


            activateAlarm(
                testReminder
            );
        }
    );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

renderContacts();

renderReminders();

requestNotificationPermission();


console.log(
    "❤️ CareAlarm loaded successfully."
);

console.log(
    "✏️ Edit buttons connected."
);

console.log(
    "📞 Call buttons connected."
);

console.log(
    "💬 WhatsApp buttons connected."
);

console.log(
    "🗑️ Delete buttons connected."
);