let frames = [];
let pageTableSize = 16;
let frameCount = 4;
let pageFaults = 0;
let totalAccesses = 0;
let currentAlgorithm = "FIFO";
let pageFaultChart;
let memoryUsageChart;
let pageTableStatusChart;

document.addEventListener("DOMContentLoaded", () => {
    const accessBtn = document.getElementById("access-btn");
    const runBtn = document.getElementById("run-sequence-btn");
    const resetBtn = document.getElementById("reset-btn");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const algoSelect = document.getElementById("algo-select");

    pageTableSize = parseInt(document.getElementById("page-table-size").value);
    frameCount = parseInt(document.getElementById("frame-count").value);

    initPageTable();
    initCharts();
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);

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

    resetBtn.onclick = async () => {
        await resetSimulation();
    };

    darkModeToggle.onchange = () => {
        document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    };
});

async function accessPage(page) {
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

        totalAccesses += 1;
        if (isFault) pageFaults += 1;

        updateFramesUI();
        updateStats();
        logAccess(page, isFault);
        updateCharts();

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
        resetSimulation();
    } catch (err) {
        console.error("Set algorithm error:", err);
        alert("Error changing algorithm: " + err.message);
    }
}

async function resetSimulation() {
    try {
        const response = await fetch("/reset", { method: "POST" });
        const data = await response.json();
        if (data.error) {
            alert("Error resetting simulation: " + data.error);
        } else {
           
            frames = [];
            pageFaults = 0;
            totalAccesses = 0;
            updateStats();
            updateFramesUI();
            document.getElementById("log-entries").innerHTML = '';
            document.getElementById("last-page").textContent = "-";
            initPageTable();
            resetCharts();
            alert(data.message);  
        }
    } catch (err) {
        console.error("Error resetting simulation:", err);
        alert("Error resetting simulation: " + err.message);
    }
}

function highlightPage(page, isFault) {
    document.querySelectorAll("#page-table .fault").forEach(el => el.classList.remove("fault"));
    const cell = document.getElementById(`page-${page}`);
    if (cell && isFault) cell.classList.add("fault");
}

function logAccess(page, isFault) {
    const log = document.getElementById("log-entries");
    const li = document.createElement("li");
    li.textContent = `Page ${page} ${isFault ? "-> Page Fault" : "-> Hit"} (${currentAlgorithm})`;
    log.appendChild(li);
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
    const faultRate = totalAccesses === 0 ? 0 : (pageFaults / totalAccesses * 100).toFixed(2);
    document.getElementById("fault-rate").textContent = `${faultRate}%`;

    const hitBar = document.getElementById("hit-rate-fill");
    if (hitBar) hitBar.style.width = `${100 - faultRate}%`;
}

function resetCharts() {
    pageFaultChart.data.labels = [];
    pageFaultChart.data.datasets[0].data = [];
    pageFaultChart.update();

    memoryUsageChart.data.datasets[0].data = Array(frameCount).fill(0);
    memoryUsageChart.update();

    pageTableStatusChart.data.datasets[0].data = Array(pageTableSize).fill(0);
    pageTableStatusChart.update();
}

function initCharts() {
    const pfCtx = document.getElementById("pageFaultChart").getContext("2d");
    pageFaultChart = new Chart(pfCtx, { type: "line", data: { labels: [], datasets: [{ label: "Page Faults", data: [], borderColor: "red", fill: false }] }, options: { responsive: true, animation: false } });

    const muCtx = document.getElementById("memoryUsageChart").getContext("2d");
    memoryUsageChart = new Chart(muCtx, { type: "bar", data: { labels: Array.from({ length: frameCount }, (_, i) => `Frame ${i}`), datasets: [{ label: "Occupied", data: Array(frameCount).fill(0), backgroundColor: "blue" }] }, options: { responsive: true, animation: false } });

    const ptsCtx = document.getElementById("pageTableStatusChart").getContext("2d");
    pageTableStatusChart = new Chart(ptsCtx, { type: "bar", data: { labels: Array.from({ length: pageTableSize }, (_, i) => `Page ${i}`), datasets: [{ label: "Loaded (1 = yes, 0 = no)", data: Array(pageTableSize).fill(0), backgroundColor: "green" }] }, options: { responsive: true, animation: false } });
}

function updateCharts() {
    pageFaultChart.data.labels.push(totalAccesses);
    pageFaultChart.data.datasets[0].data.push(pageFaults);
    pageFaultChart.update();

    memoryUsageChart.data.datasets[0].data = Array(frameCount).fill(0);
    frames.forEach(f => memoryUsageChart.data.datasets[0].data[f] = 1);
    memoryUsageChart.update();

    pageTableStatusChart.data.datasets[0].data = Array(pageTableSize).fill(0);
    frames.forEach(p => pageTableStatusChart.data.datasets[0].data[p] = 1);
    pageTableStatusChart.update();
}

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

