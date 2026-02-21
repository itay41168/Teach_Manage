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

const exportExcelBtn = document.getElementById("exportExcelBtn");
const statsBtn = document.getElementById("statsBtn");

/* =========================
   DATA
========================= */
let classes = JSON.parse(localStorage.getItem("classes")) || [];
let selectedClassId = null;
let selectedMonthId = null;

const monthNames = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"
];

/* =========================
   INIT DEFAULT CLASSES
========================= */
if(classes.length === 0){
  classes = [
    {id: Date.now()+1, name:"ז1", months:[]},
    {id: Date.now()+2, name:"ז2", months:[]},
    {id: Date.now()+3, name:"ח1", months:[]}
  ];
  localStorage.setItem("classes", JSON.stringify(classes));
}

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
  classesScreen.style.display="block";
  monthsScreen.style.display="none";
  trackingScreen.style.display="none";
}
function showMonths() {
  classesScreen.style.display="none";
  monthsScreen.style.display="block";
  trackingScreen.style.display="none";
}
function showTracking() {
  classesScreen.style.display="none";
  monthsScreen.style.display="none";
  trackingScreen.style.display="block";
}

/* =========================
   HELPERS
========================= */
function getSelectedClass() { return classes.find(c=>c.id===selectedClassId); }
function getSelectedMonth() { return getSelectedClass()?.months.find(m=>m.id===selectedMonthId); }
function daysInMonth(month, year) { return new Date(year, month,0).getDate(); }
function getHebrewDayName(dateObj){
  const days=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
  return days[dateObj.getDay()];
}
function formatDate(day, month){ return `${day}.${String(month).padStart(2,"0")}`; }

/* =========================
   DEBOUNCE
========================= */
function debounce(func, wait){
  let timeout;
  return function(...args){
    clearTimeout(timeout);
    timeout=setTimeout(()=>func.apply(this,args), wait);
  };
}

/* =========================
   RENDER CLASSES
========================= */
function renderClasses(){
  classes = JSON.parse(localStorage.getItem("classes")) || [];
  classesContainer.innerHTML="";
  classes.forEach((cls,index)=>{
    const card = document.createElement("div");
    card.className="class-card";
    card.textContent=cls.name;

    const del = document.createElement("button");
    del.className="delete-btn";
    del.textContent="×";
    del.onclick=(e)=>{
      e.stopPropagation();
      if(confirm("למחוק כיתה?")){
        classes.splice(index,1);
        if(selectedClassId===cls.id) selectedClassId=null;
        save(); renderClasses();
      }
    };

    card.onclick=()=>{
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
  if(!name) return;

  // סנכרון לפני הוספה
  classes = JSON.parse(localStorage.getItem("classes")) || [];

  const newClass = {id:Date.now(), name, months:[]};
  classes.push(newClass);
  save(); renderClasses();
};

/* =========================
   RENDER MONTHS
========================= */
function renderMonths(){
  const cls = getSelectedClass();
  if(!cls) return;
  monthsContainer.innerHTML="";
  cls.months.forEach((month,index)=>{
    const card = document.createElement("div");
    card.className="class-card";
    card.textContent = month.name;

    const del = document.createElement("button");
    del.className="delete-btn"; del.textContent="×";
    del.onclick=(e)=>{
      e.stopPropagation();
      if(confirm("למחוק חודש?")){
        cls.months.splice(index,1);
        save(); renderMonths();
      }
    };

    card.onclick=()=>{
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
  const monthIndex = Number(prompt("בחר חודש (1-12):"));
  const year = Number(prompt("שנה:"));
  if(!monthIndex || !year || monthIndex<1 || monthIndex>12) return;

  const cls = getSelectedClass();
  cls.months.push({
    id:Date.now(),
    name:`${monthNames[monthIndex-1]} ${year}`,
    month: monthIndex,
    year: year,
    tracking:[]
  });
  save(); renderMonths();
};

/* =========================
   RENDER TRACKING
========================= */
function renderTracking(){
  const month = getSelectedMonth();
  if(!month) return;
  trackingBody.innerHTML="";
  month.tracking.forEach((row,index)=>addRowToTable(row,index));
  if(month.tracking.length===0) addNewDay();
  enableRowDrag();
}

/* =========================
   ADD ROW UI + מחיקה + שינוי יום/תאריך
========================= */
function addRowToTable(row,index){
  const month=getSelectedMonth();
  if(!month) return;
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td>
      <select class="day-select">
        <option>ראשון</option><option>שני</option><option>שלישי</option>
        <option>רביעי</option><option>חמישי</option><option>שישי</option><option>שבת</option>
      </select>
    </td>
    <td><input class="date-input" value="${row.dateStr||""}"></td>
    <td><input value="${row.status||""}"></td>
    <td><input value="${row.notes||""}"></td>
    <td><button class="delete-row-btn">🗑</button></td>
  `;
  const daySelect=tr.querySelector(".day-select");
  const dateInput=tr.querySelector(".date-input");
  const inputs=tr.querySelectorAll("input:not(.date-input)");

  if(row.dayName) daySelect.value = row.dayName;

  daySelect.onchange=debounce(()=>{ row.dayName=daySelect.value; save(); },500);
  dateInput.oninput=debounce(()=>{
    const parts=dateInput.value.split(".");
    if(parts.length===2){
      const day=parseInt(parts[0],10);
      const monthNum=parseInt(parts[1],10);
      const dateObj=new Date(month.year,monthNum-1,day);
      if(!isNaN(dateObj.getTime())){
        row.dateStr=formatDate(day,monthNum);
        row.dayName=getHebrewDayName(dateObj);
        daySelect.value=row.dayName;
        save();
      }
    }
  },500);
  inputs[0].oninput=debounce(()=>{ row.status=inputs[0].value; save(); },500);
  inputs[1].oninput=debounce(()=>{ row.notes=inputs[1].value; save(); },500);

  tr.querySelector(".delete-row-btn").onclick=()=>{
    if(!confirm("למחוק יום זה?")) return;
    month.tracking.splice(index,1);
    month.tracking.forEach((r,i)=>r.dayNumber=i+1);
    save(); renderTracking();
  };

  trackingBody.appendChild(tr);
}

/* =========================
   ADD NEW DAY
========================= */
function addNewDay(){
  const month=getSelectedMonth();
  if(!month) return;
  const totalDays=daysInMonth(month.month,month.year);
  const nextDay=month.tracking.length+1;
  if(nextDay>totalDays){ alert("אין יותר ימים בחודש"); return; }
  const dateObj=new Date(month.year,month.month-1,nextDay);
  if(isNaN(dateObj.getTime())){ alert("שגיאה ביצירת תאריך"); return; }
  const dayName=getHebrewDayName(dateObj);
  const dateStr=formatDate(nextDay,month.month);
  month.tracking.push({dayNumber:nextDay, dayName, dateStr, status:"", notes:""});
  save(); renderTracking();
}
addDayBtn.onclick = addNewDay;

/* =========================
   BACK BUTTONS
========================= */
backToClasses.onclick=showClasses;
backToMonths.onclick=showMonths;

/* =========================
   DRAG & DROP ROWS
========================= */
function enableRowDrag(){
  let dragSrcEl=null;
  function handleDragStart(e){ dragSrcEl=this; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/html',this.innerHTML);}
  function handleDragOver(e){ if(e.preventDefault)e.preventDefault(); return false; }
  function handleDrop(e){ if(e.stopPropagation)e.stopPropagation();
    if(dragSrcEl!==this){
      dragSrcEl.innerHTML=this.innerHTML; this.innerHTML=e.dataTransfer.getData('text/html');
      const month=getSelectedMonth();
      const indexA=Array.from(trackingBody.children).indexOf(dragSrcEl);
      const indexB=Array.from(trackingBody.children).indexOf(this);
      const temp=month.tracking[indexA]; month.tracking[indexA]=month.tracking[indexB]; month.tracking[indexB]=temp;
      month.tracking.forEach((r,i)=>r.dayNumber=i+1);
      save(); renderTracking();
    }
    return false;
  }
  trackingBody.querySelectorAll("tr").forEach(row=>{
    row.setAttribute("draggable",true);
    row.addEventListener("dragstart",handleDragStart,false);
    row.addEventListener("dragover",handleDragOver,false);
    row.addEventListener("drop",handleDrop,false);
  });
}

/* =========================
   EXPORT EXCEL
========================= */
exportExcelBtn.onclick=()=>{
  const month=getSelectedMonth(); if(!month) return;
  let csv="יום,תאריך,סטטוס,הערות\n";
  month.tracking.forEach(row=>{
    csv+=`"${row.dayName}","${row.dateStr}","${row.status}","${row.notes}"\n`;
  });
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`${month.name}.csv`;
  a.click();
};

/* =========================
   סטטיסטיקות
========================= */
statsBtn.onclick=()=>{
  const month=getSelectedMonth(); if(!month) return;
  const totalDays=month.tracking.length;
  const filled=month.tracking.filter(r=>r.status.trim()!=="").length;
  alert(`סה"כ ימים: ${totalDays}\nימים עם סטטוס מלא: ${filled}\nימים ריקים: ${totalDays-filled}`);
};

/* =========================
   INIT
========================= */
renderClasses();
showClasses();
