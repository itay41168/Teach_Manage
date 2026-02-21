/* =========================
   ELEMENTS
========================= */

const classesScreen = document.getElementById("classesScreen");
const monthsScreen = document.getElementById("monthsScreen");
const trackingScreen = document.getElementById("trackingScreen");

const classesContainer = document.getElementById("classesContainer");
const monthsContainer = document.getElementById("monthsContainer");
const trackingBody = document.getElementById("trackingBody");

const addClassBtn = document.getElementById("addClassBtn");
const addMonthBtn = document.getElementById("addMonthBtn");
const addDayBtn = document.getElementById("addDayBtn");

const backToClasses = document.getElementById("backToClasses");
const backToMonths = document.getElementById("backToMonths");

const monthsTitle = document.getElementById("monthsTitle");
const trackingTitle = document.getElementById("trackingTitle");


/* =========================
   DATA
========================= */

let classes = JSON.parse(localStorage.getItem("classes")) || [];
let selectedClassId = null;
let selectedMonthId = null;


/* =========================
   SAVE
========================= */

function save() {
  localStorage.setItem("classes", JSON.stringify(classes));
}


/* =========================
   SCREENS
========================= */

function showClasses() {
  classesScreen.style.display = "block";
  monthsScreen.style.display = "none";
  trackingScreen.style.display = "none";
}

function showMonths() {
  classesScreen.style.display = "none";
  monthsScreen.style.display = "block";
  trackingScreen.style.display = "none";
}

function showTracking() {
  classesScreen.style.display = "none";
  monthsScreen.style.display = "none";
  trackingScreen.style.display = "block";
}


/* =========================
   HELPERS
========================= */

function getSelectedClass() {
  return classes.find(c => c.id === selectedClassId);
}

function getSelectedMonth() {
  return getSelectedClass().months.find(m => m.id === selectedMonthId);
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function getHebrewDayName(dateObj) {

  const days = [
    "ראשון",
    "שני",
    "שלישי",
    "רביעי",
    "חמישי",
    "שישי",
    "שבת"
  ];

  return days[dateObj.getDay()];
}

function formatDate(day, month) {
  return `${day}.${String(month).padStart(2,"0")}`;
}




/* =========================
   RENDER CLASSES
========================= */

function renderClasses() {
  classesContainer.innerHTML = "";

  classes.forEach((cls, index) => {

    const card = document.createElement("div");
    card.className = "class-card";
    card.textContent = cls.name;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "×";

    del.onclick = (e) => {
      e.stopPropagation();
      if (confirm("למחוק כיתה?")) {
        classes.splice(index, 1);
        save();
        renderClasses();
      }
    };

    card.onclick = () => {
      selectedClassId = cls.id;
      monthsTitle.textContent = "חודשים - " + cls.name;
      renderMonths();
      showMonths();
    };

    card.appendChild(del);
    classesContainer.appendChild(card);
  });
}


/* =========================
   ADD CLASS
========================= */

addClassBtn.onclick = () => {
  const name = prompt("שם הכיתה:");
  if (!name) return;

  classes.push({
    id: Date.now(),
    name,
    months: []
  });

  save();
  renderClasses();
};


/* =========================
   RENDER MONTHS
========================= */

function renderMonths() {

  const cls = getSelectedClass();
  monthsContainer.innerHTML = "";

  cls.months.forEach((month, index) => {

    const card = document.createElement("div");
    card.className = "class-card";
    card.textContent = month.name;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "×";

    del.onclick = (e) => {
      e.stopPropagation();
      if (confirm("למחוק חודש?")) {
        cls.months.splice(index, 1);
        save();
        renderMonths();
      }
    };

    card.onclick = () => {
      selectedMonthId = month.id;
      trackingTitle.textContent = "מעקב - " + month.name;
      renderTracking();
      showTracking();
    };

    card.appendChild(del);
    monthsContainer.appendChild(card);
  });
}


/* =========================
   ADD MONTH
========================= */

addMonthBtn.onclick = () => {

  const monthNumber = Number(prompt("מספר חודש (1-12):"));
  const year = Number(prompt("שנה:"));

  if (!monthNumber || !year) return;

  const cls = getSelectedClass();

  cls.months.push({
    id: Date.now(),
    name: `חודש ${monthNumber}/${year}`,
    month: monthNumber,
    year: year,
    tracking: []
  });

  save();
  renderMonths();
};


/* =========================
   RENDER TRACKING
========================= */

function renderTracking() {

  const month = getSelectedMonth();
  if (!month) return;

  trackingBody.innerHTML = "";

  month.tracking.forEach((row, index) => {
    addRowToTable(row, index);
  });

  if (month.tracking.length === 0) {
    addNewDay();
  }
}


/* =========================
   ADD ROW UI
========================= */

function addRowToTable(row, index) {

  const month = getSelectedMonth();

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input value="${row.dayName || ""}"></td>
    <td><input value="${row.dateStr || ""}"></td>
    <td><input value="${row.status || ""}"></td>
    <td><input value="${row.notes || ""}"></td>
    <td><button class="delete-row-btn">🗑</button></td>
  `;

  const inputs = tr.querySelectorAll("input");

  inputs[0].oninput = (e) => {
    row.dayName = e.target.value;
    save();
  };

  inputs[1].oninput = (e) => {
    row.dateStr = e.target.value;
    save();
  };

  inputs[2].oninput = (e) => {
    row.status = e.target.value;
    save();
  };

  inputs[3].oninput = (e) => {
    row.notes = e.target.value;
    save();
  };

  /* מחיקת שורה */
  tr.querySelector(".delete-row-btn").onclick = () => {

    if (!confirm("למחוק יום זה?")) return;

    month.tracking.splice(index, 1);

    /* סידור מחדש של מספרי ימים */
    month.tracking.forEach((r, i) => {
      r.dayNumber = i + 1;
    });

    save();
    renderTracking();
  };

  trackingBody.appendChild(tr);
}


/* =========================
   ADD NEW DAY
========================= */

function addNewDay() {

  const month = getSelectedMonth();
  if (!month) return;

  const totalDays = daysInMonth(month.month, month.year);
  const nextDay = month.tracking.length + 1;

  if (nextDay > totalDays) {
    alert("אין יותר ימים בחודש");
    return;
  }

  const dateObj = new Date(month.year, month.month - 1, nextDay);

  if (isNaN(dateObj.getTime())) {
    alert("שגיאה ביצירת תאריך");
    return;
  }

  const dayName = getHebrewDayName(dateObj);
  const dateStr = formatDate(nextDay, month.month);

  const newRow = {
    dayNumber: nextDay,
    dayName,
    dateStr,
    status: "",
    notes: ""
  };

  month.tracking.push(newRow);

  save();
  renderTracking();
}

addDayBtn.onclick = addNewDay;


/* =========================
   BACK BUTTONS
========================= */


backToClasses.onclick = showClasses;
backToMonths.onclick = showMonths;


/* =========================
   INIT
========================= */

renderClasses();
showClasses();
localStorage.clear()
