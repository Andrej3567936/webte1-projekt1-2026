const SEMESTER_START = new Date("2026-09-14T00:00:00");
const SEMESTER_END = new Date("2026-12-11T23:59:59");






document.addEventListener("DOMContentLoaded", function() { //web zacne vykonavat tuto funkciu az ked docita cely html kod
    initScheduleFilter(); //
    checkCurrentLesson();//jednotlive funckie
    initSemesterProgressBar();
})

function initScheduleFilter() {
    const filterButtons = document.querySelectorAll(".legend-btn"); //prejde html a vytvori pole(nodelist) vsetkych objektov button
    const scheduleCells = document.querySelectorAll(".schedule-table td[data-type]"); //pole pre vsetky td co maju udaj data-type
    const emptyMsg = document.getElementById("filter-empty-msg");

    filterButtons.forEach(function (button) { //prejde tlacidla a kazdeho obvjekt priradi do premenjje objekt
        button.addEventListener("click", function() { //caka kym user stlaci na tlacidlo, potm toto vykona
            filterButtons.forEach(function (btn) { //konkretne tlacidlo ulozi do premennej btn
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const chosenFilter = button.getAttribute("data-filter"); //na button mame kliknute, zistim jeho atribut data-filter, do chosen-filter ulozi co je to za typ 
            let matchCount = 0

            scheduleCells.forEach(function (cell) { //cell je premenna pre okna v rozvrhu
                const cellType = cell.getAttribute("data-type");  //zisti co je to za typ 

                if (chosenFilter === "all" || cellType === chosenFilter) {
                    cell.classList.remove("cell-dimmed"); 
                    matchCount++;
                } else {
                    cell.classList.add("cell-dimmed");
                }
            });

            if (emptyMsg) {
                if (matchCount === 0) {
                    emptyMsg.hidden = false;
                }else{
                    emptyMsg.hidden = true;
                }


                
            }
        });
    });
}

// Dátové štruktúry: pole objektov s časmi hodín podľa tvojho rozvrhu
const LESSONS = [
    { day: 1, startH: 11, startM: 0, endH: 12, endM: 40, title: "Webové technológie 1" },
    { day: 1, startH: 13, startM: 0, endH: 14, endM: 40, title: "Operačné systémy" },
    { day: 1, startH: 15, startM: 0, endH: 16, endM: 40, title: "Lineárna algebra 2" },
    { day: 2, startH: 8,  startM: 0, endH: 9,  endM: 40, title: "Analýza a zlož. algoritmov" },
    { day: 2, startH: 10, startM: 0, endH: 11, endM: 40, title: "Webové technológie 1" },
    { day: 2, startH: 13, startM: 0, endH: 14, endM: 40, title: "Telesná kultúra 5" },
    { day: 3, startH: 8,  startM: 0, endH: 9,  endM: 40, title: "Operačné systémy" },
    { day: 3, startH: 10, startM: 0, endH: 11, endM: 40, title: "Analýza a zlož. algoritmov" },
    { day: 3, startH: 14, startM: 0, endH: 15, endM: 40, title: "Webové technológie 1" },
    { day: 5, startH: 8,  startM: 0, endH: 9,  endM: 40, title: "Lineárna algebra 2" },
];

const DAYS_SK = [
    "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"
];

function checkCurrentLesson() {
    const statusBox = document.getElementById("schedule-status");
    if (!statusBox) {
        return;
    }

    const now = new Date();
    const currentDay = now.getDay(); 
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let ongoing = null;

    // Najprv odstránime triedu current-lesson z predchádzajúcich buniek
    const allCells = document.querySelectorAll(".schedule-table td[data-type]");
    allCells.forEach(function (cell) {
        cell.classList.remove("current-lesson");
    });

    // Zistenie, či práve prebieha hodina
    LESSONS.forEach(function (lesson) { //kazdu z hodin na chvilu hodi do premennej lesson
        const start = lesson.startH * 60 + lesson.startM;
        const end = lesson.endH * 60 + lesson.endM;

        if (lesson.day === currentDay && currentMinutes >= start && currentMinutes < end) {
            ongoing = lesson;
        }
    });

    if (ongoing !== null) { 
        statusBox.textContent = "Práve prebieha: " + ongoing.title;

        allCells.forEach(function (cell) {

            const rowDay = cell.parentElement.getAttribute("data-day");

            if (cell.textContent.includes(ongoing.title) && Number(rowDay) === ongoing.day) {
                cell.classList.add("current-lesson");
            }

        });

    } else { //ak neprebieha rn hodina
        // Hľadanie najbližšej hodiny
        let nextLesson = null;
        let minDiff = Infinity;

        LESSONS.forEach(function (lesson) {
            let dayDiff = lesson.day - currentDay;
            if (dayDiff < 0) {
                dayDiff = dayDiff + 7;
            }

            const lessonMinutes = lesson.startH * 60 + lesson.startM;
            let totalDiff = (dayDiff * 24 * 60) + (lessonMinutes - currentMinutes);

            if (totalDiff <= 0) {
                totalDiff = totalDiff + (7 * 24 * 60);
            }

            if (totalDiff < minDiff) { //hladame minium rozdiel teda hodinu s nmajmensim rozdielom aktualneho casu s jej zaciatkom
                minDiff = totalDiff;
                nextLesson = lesson;
            }
        });

        if (nextLesson !== null) {
            let formatM = nextLesson.startM;
            if (formatM < 10) { //osetrenie naj nevypise 7:9 ale 7:09
                formatM = "0" + formatM;
            }
            statusBox.textContent = "Aktuálne neprebieha žiadna výučba. Najbližšia hodina: " +
                DAYS_SK[nextLesson.day] + " o " + nextLesson.startH + ":" + formatM + " (" + nextLesson.title + ").";
        }
    }
}



function initSemesterProgressBar() {
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    const daysLeft = document.getElementById("progress-days-left");
    if (!fill || !text) {
        return;
    }

    const now = new Date();
    const totalTime = SEMESTER_END.getTime() - SEMESTER_START.getTime();
    const elapsedTime = now.getTime() - SEMESTER_START.getTime();
    const daysTillEnd = Math.ceil((totalTime - elapsedTime)/(1000*60*60*24)); //time dava v milisekundach

    let percent = Math.floor((elapsedTime / totalTime) * 100); //zaokruhli nadol

    if (percent < 0) {
        percent = 0;
    }
    if (percent > 100) {
        percent = 100;
    }

    fill.style.width = percent + "%";
    text.textContent = percent + "% semestra uplynulo";
    daysLeft.textContent = daysTillEnd + " dní do konca semestra"
}