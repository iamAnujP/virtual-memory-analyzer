let frames = [];
let pageTableSize = 16;
let frameCount = 4;
let pageFaults = 0;
let totalAccesses = 0;

document.addEventListener("DOMContentLoaded", () => {
    const accessBtn = document.getElementById("access-btn");
    const runBtn = document.getElementById("run-sequence-btn");
    const stepBtn = document.getElementById("step-btn");
    const resetBtn = document.getElementById("reset-btn");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    pageTableSize = parseInt(document.getElementById("page-table-size").value);
    frameCount = parseInt(document.getElementById("frame-count").value);

    initPageTable();

    accessBtn.onclick = () => {
        const page = parseInt(document.getElementById("page-input").value);
        if (!isNaN(page)) {
            accessPage(page);
        }
    };

    runBtn.onclick = () => {
        const seq = document.getElementById("access-sequence").value.split(",").map(s => parseInt(s.trim()));
        seq.forEach((page, index) => {
            setTimeout(() => accessPage(page), index * 500);
        });
    };

    resetBtn.onclick = resetSimulation;

    darkModeToggle.onchange = () => {
        document.body.classList.toggle("dark-mode");
    };
});

function initPageTable() {
    const table = document.getElementById("page-table");
    table.innerHTML = '';
    for (let i = 0; i < pageTableSize; i++) {
        const cell = document.createElement("div");
        cell.id = `page-${i}`;
        cell.textContent = i;
        table.appendChild(cell);
    }
}

function accessPage(page) {
    totalAccesses++;
    const isFault = !frames.includes(page);
    if (isFault) {
        pageFaults++;
        if (frames.length >= frameCount) {
            frames.shift(); // FIFO by default
        }
        frames.push(page);
    }

    updateFramesUI();
    updateStats();
    logAccess(page, isFault);

    document.getElementById("last-page").textContent = page;
    highlightPage(page, isFault);
}

function updateFramesUI() {
    const frameDiv = document.getElementById("frames");
    frameDiv.innerHTML = '';
    frames.forEach(page => {
        const cell = document.createElement("div");
        cell.textContent = page;
        frameDiv.appendChild(cell);
    });
}

function updateStats() {
    document.getElementById("total-accesses").textContent = totalAccesses;
    document.getElementById("page-faults").textContent = pageFaults;
    const rate = totalAccesses === 0 ? 0 : ((pageFaults / totalAccesses) * 100).toFixed(2);
    document.getElementById("fault-rate").textContent = `${rate}%`;
}

function highlightPage(page, isFault) {
    document.querySelectorAll("#page-table .fault").forEach(el => el.classList.remove("fault"));
    const cell = document.getElementById(`page-${page}`);
    if (cell && isFault) {
        cell.classList.add("fault");
    }
}

function logAccess(page, isFault) {
    const log = document.getElementById("log-entries");
    const li = document.createElement("li");
    li.textContent = `Page ${page} ${isFault ? "-> Page Fault" : "-> Hit"}`;
    log.appendChild(li);
}

function resetSimulation() {
    frames = [];
    pageFaults = 0;
    totalAccesses = 0;
    updateStats();
    updateFramesUI();
    document.getElementById("log-entries").innerHTML = '';
    document.getElementById("last-page").textContent = "-";
    initPageTable();
}
