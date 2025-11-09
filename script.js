let frames = [];
let pageTableSize = 16;
let frameCount = 4;
let pageFaults = 0;
let totalAccesses = 0;
let currentAlgorithm = "FIFO";

document.addEventListener("DOMContentLoaded", () => {
    const accessBtn = document.getElementById("access-btn");
    const runBtn = document.getElementById("run-sequence-btn");
    const stepBtn = document.getElementById("step-btn");
    const resetBtn = document.getElementById("reset-btn");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const algoSelect = document.getElementById("algo-select");

    pageTableSize = parseInt(document.getElementById("page-table-size").value);
    frameCount = parseInt(document.getElementById("frame-count").value);

    initPageTable();

    // Change algorithm when user selects new one
    algoSelect.onchange = async () => {
        currentAlgorithm = algoSelect.value;
        await setAlgorithm(currentAlgorithm);
    };

    accessBtn.onclick = async () => {
        const page = parseInt(document.getElementById("page-input").value);
        if (!isNaN(page)) {
            await accessPage(page);
        }
    };

    runBtn.onclick = async () => {
        const seqInput = document.getElementById("access-sequence").value;
        const sequence = seqInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        for (let i = 0; i < sequence.length; i++) {
            await new Promise(r => setTimeout(r, 500));
            await accessPage(sequence[i]);
        }
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

async function accessPage(page) {
    totalAccesses++;

    try {
        const response = await fetch("/access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ page })
        });
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        frames = data.frames;
        const isFault = data.last_fault;

        if (isFault) pageFaults++;

        updateFramesUI();
        updateStats();
        logAccess(page, isFault);

        document.getElementById("last-page").textContent = page;
        highlightPage(page, isFault);

    } catch (err) {
        console.error("Access error:", err);
        alert("Error accessing page: " + err.message);
    }
}

async function setAlgorithm(algorithm) {
    try {
        const response = await fetch("/set_algorithm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ algorithm })
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        console.log(`✅ Switched to ${data.algorithm} algorithm`);
        resetSimulation();

    } catch (err) {
        console.error("Set algorithm error:", err);
        alert("Error changing algorithm: " + err.message);
    }
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
    li.textContent = `Page ${page} ${isFault ? "-> Page Fault" : "-> Hit"} (${currentAlgorithm})`;
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

