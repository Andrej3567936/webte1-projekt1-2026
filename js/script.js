const SEMESTER_START = new Date("2026-09-14T00:00:00");
const SEMESTER_END = new Date("2026-12-11T23:59:59");






document.addEventListener("DOMContentLoaded", function() { //web zacne vykonavat tuto funkciu az ked docita cely html kod
    initScheduleFilter(); //
    checkCurrentLesson();//jednotlive funckie
    initSemesterProgressBar();
    pointsOnImg();
    mapResponsivity();
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
     "Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"
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


function pointsOnImg() {
    const WORKSPACE_ITEMS = [
        { id: "ipad", title: "iPad", desc: "Využívam na písanie poznámok a prípravu na zápočty.", left: 14, top: 68 },
        { id: "keyboard", title: "Klávesnica", desc: "Mechanická low-profile Kechychron K3 MAX.", left: 45, top: 85 },
        { id: "mouse", title: "Myš", desc: "Logitech MX Master 3s", left: 65, top: 76 },
        { id: "macbook", title: "MacBook", desc: "Macbook Air M1 - powerhouse celého setupu.", left: 45, top: 62 },
        { id: "monitor", title: "Externý Monitor", desc: "27' LG UltraFine 4k - väčšia plocha na prácu.", left: 45, top: 25 },
        { id: "cat", title: "Lego Mačka", desc: "Dozerá na moje sústredenie.", left: 80, top: 57 },
        { id: "water", title: "Pitný režim", desc: "Základ pre správnu funkciu mozgu.", left: 92, top: 60 }
    ];

    const container = document.getElementById("workspace-container");
    if (!container) return;

    WORKSPACE_ITEMS.forEach(function(item) {
        // 1. Neviditeľný obal
        const hotspot = document.createElement("div");
        hotspot.classList.add("hotspot");
        // Súradnice zapíšeme ako CSS premenné
        hotspot.style.setProperty("--x", item.left + "%");
        hotspot.style.setProperty("--y", item.top + "%");

        // 2. Samotný zelený krúžok (reálne tlačidlo pre klikanie/fokus)
        const dot = document.createElement("button");
        dot.classList.add("hotspot-dot");
        dot.setAttribute("tabindex", "0");

        // 3. Panel s textom
        const panel = document.createElement("div");
        panel.classList.add("panel");

        const title = document.createElement("h4");
        title.textContent = item.title;

        const desc = document.createElement("p");
        desc.textContent = item.desc;

        panel.appendChild(title);
        panel.appendChild(desc);
        
        // Všetko pekne poskladáme
        hotspot.appendChild(dot);
        hotspot.appendChild(panel);
        container.appendChild(hotspot);
    });
}


function mapResponsivity() {
    const TARGETS = {
        school: { name: "Škola (FEI STU)", lat: 48.1518, lng: 17.0733 },
        home:   { name: "Bydlisko (Prešov)", lat: 48.9984, lng: 21.2339 }
    };

    let savedPoints = JSON.parse(localStorage.getItem("myMapPoints")) || [];

    let currentPolyline = null;
    const pointMarkers = [];

    const map = L.map('map').setView([48.7, 19.3], 7);

    // Načítanie podkladu (OpenStreetMap)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);

    // Vyznačenie trvalých bodov na mape
    L.marker([TARGETS.school.lat, TARGETS.school.lng]).addTo(map).bindPopup("<b>" + TARGETS.school.name + "</b>");
    L.marker([TARGETS.home.lat, TARGETS.home.lng]).addTo(map).bindPopup("<b>" + TARGETS.home.name + "</b>");

    // Elementy HTML rozhrania
    const emptyState = document.getElementById("map-empty-state");
    const controls = document.getElementById("map-controls");
    const selectCustom = document.getElementById("custom-points");
    const selectTarget = document.getElementById("target-points");
    const btnCalc = document.getElementById("btn-calculate");
    const resultBox = document.getElementById("distance-result");

    renderSavedPoints();

    map.on('click', function (e) {
        // e.latlng obsahuje súradnice, kam používateľ klikol
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Vyskakovacie okno pre zadanie názvu (jednoduchý prompt)
        const pointName = prompt("Zadajte názov pre toto miesto:");

        // Ak používateľ stlačil Zrušiť alebo nevyplnil nič, neurobíme nič
        if (!pointName || pointName.trim() === "") return;

        // Vytvoríme objekt bodu a pridáme ho do poľa
        const newPoint = {
            id: Date.now(), // Unikátne ID (čas)
            name: pointName.trim(),
            lat: lat,
            lng: lng
        };

        savedPoints.push(newPoint);

        // Uloženie do localStorage, aby to prežilo F5 (Refresh)
        localStorage.setItem("myMapPoints", JSON.stringify(savedPoints));

        // Aktualizácia UI a mapy
        renderSavedPoints();
    });

    // ===================================================
    // VYKRESLENIE BODOV DO VÝBERU A NA MAPU
    // ===================================================
    function renderSavedPoints() {
        // Najprv vyčistíme mapu od starých custom značiek
        pointMarkers.forEach(marker => map.removeLayer(marker));
        pointMarkers.length = 0; // Vyprázdnime pole

        // Vyčistíme dropdown s výberom
        selectCustom.innerHTML = "";

        if (savedPoints.length === 0) {
            // Prázdny stav - ukáž inštrukcie, skry ovládanie
            emptyState.hidden = false;
            controls.hidden = true;
        } else {
            // Máme body - skry inštrukcie, ukáž ovládanie
            emptyState.hidden = true;
            controls.hidden = false;

            // Pridáme body do dropdownu a na mapu
            savedPoints.forEach(function (pt) {
                // Do Selectu
                const option = document.createElement("option");
                option.value = pt.id;
                option.textContent = pt.name;
                selectCustom.appendChild(option);

                // Na Mapu
                const marker = L.marker([pt.lat, pt.lng]).addTo(map).bindPopup(pt.name);
                pointMarkers.push(marker);
            });
        }
    }

    // ===================================================
    // VÝPOČET A ZOBRAZENIE SPOJNICE (PO KLIKNUTÍ NA TLAČIDLO)
    // ===================================================
    btnCalc.addEventListener("click", function () {
        const selectedId = Number(selectCustom.value);
        const selectedTargetKey = selectTarget.value; // "school" alebo "home"

        // Nájdeme objekty z polí
        const startPoint = savedPoints.find(p => p.id === selectedId);
        const endPoint = TARGETS[selectedTargetKey];

        if (!startPoint || !endPoint) return;

        // Vlastný výpočet vzdialenosti (Haversinov vzorec)
        const distanceKm = haversineDistance(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);

        // Zobrazenie výsledku do HTML
        resultBox.hidden = false;
        resultBox.innerHTML = `
            <strong>Trasa:</strong> ${startPoint.name} &rarr; ${endPoint.name}<br>
            <strong>Vzdialenosť (vzdušnou čiarou):</strong> ${distanceKm.toFixed(2)} km
        `;

        // Zmazanie starej čiary, ak existuje
        if (currentPolyline) {
            map.removeLayer(currentPolyline);
        }

        // Vykreslenie novej čiary (spojnice) - v zadaní je to výslovne požadované
        const latlngs = [
            [startPoint.lat, startPoint.lng],
            [endPoint.lat, endPoint.lng]
        ];

        currentPolyline = L.polyline(latlngs, { color: 'var(--color-title)', weight: 4 }).addTo(map);

        // Mapa sa plynulo posunie tak, aby bolo vidieť celú čiaru
        map.fitBounds(currentPolyline.getBounds(), { padding: [50, 50] });
    });

    // ===================================================
    // HAVERSINOV VZOREC (Vlastný kód na výpočet vzdialenosti)
    // ===================================================
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Polomer Zeme v kilometroch
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
                  
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Výsledok v km
    }
}






     