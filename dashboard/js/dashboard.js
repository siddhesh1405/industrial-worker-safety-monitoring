const REFRESH_INTERVAL = 5000;
const DEPARTMENTS = [
    "Assembly Line",
    "Packaging",
    "Chemical Storage",
    "Loading Dock",
    "Furnace Area"
];

let allWorkers = [];
let hasLoadedOnce = false;
let eventLogRecords = [];
let emergencyBannerDismissed = false;
let dismissedEmergencySignature = "";
let previousWorkerStates = {};

document.addEventListener("DOMContentLoaded", () => {
    setupClock();
    setupNavigation();
    setupSidebar();
    setupFilters();
    setupEmergencyControls();
    setupReportActions();
    setupManualRefresh();
    startDashboardData();
});

function setupClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const dateElement = document.getElementById("currentDate");
    const timeElement = document.getElementById("currentTime");

    dateElement.textContent = now.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    timeElement.textContent = now.toLocaleTimeString("en-GB");
}

function setupNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const currentPage = document.body.dataset.page || "dashboard";

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeSidebarOnSmallScreen();
        });
    });

    setActiveNavLink(currentPage);
    animateCurrentPage();
}

function setActiveNavLink(pageName) {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.page === pageName);
    });
}

function animateCurrentPage() {
    const section = document.querySelector(".content-section");

    if (!section) {
        return;
    }

    requestAnimationFrame(() => {
        section.classList.add("section-focus");
    });
}

function setupSidebar() {
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
        const clickedInsideSidebar = sidebar.contains(event.target);
        const clickedToggle = menuToggle.contains(event.target);

        if (!clickedInsideSidebar && !clickedToggle) {
            closeSidebarOnSmallScreen();
        }
    });
}

function closeSidebarOnSmallScreen() {
    if (window.innerWidth <= 820) {
        document.getElementById("sidebar").classList.remove("open");
    }
}

function setupFilters() {
    const filterElements = [
        document.getElementById("workerNameSearch"),
        document.getElementById("workerIdSearch"),
        document.getElementById("departmentFilter"),
        document.getElementById("riskFilter")
    ].filter(Boolean);

    filterElements.forEach((element) => {
        element.addEventListener("input", renderLiveMonitoring);
        element.addEventListener("change", renderLiveMonitoring);
    });

    const resetButton = document.getElementById("resetFilters");

    if (resetButton) {
        resetButton.addEventListener("click", resetFilters);
    }
}

function setupEmergencyControls() {
    const dismissButton = document.getElementById("dismissEmergencyBanner");

    if (dismissButton) {
        dismissButton.addEventListener("click", () => {
            emergencyBannerDismissed = true;
            dismissedEmergencySignature = getEmergencySignature(allWorkers);
            hideElement("emergencyBanner");
        });
    }
}

function setupReportActions() {
    const csvButton = document.getElementById("exportCsvButton");
    const pdfButton = document.getElementById("exportPdfButton");

    if (csvButton) {
        csvButton.addEventListener("click", exportEventLogsCsv);
    }

    if (pdfButton) {
        pdfButton.addEventListener("click", () => {
            setText("reportNote", "PDF export is prepared as a future reporting enhancement.");
        });
    }
}

function resetFilters() {
    setFieldValue("workerNameSearch", "");
    setFieldValue("workerIdSearch", "");
    setFieldValue("departmentFilter", "");
    setFieldValue("riskFilter", "");
    renderLiveMonitoring();
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);

    if (field) {
        field.value = value;
    }
}

function setupManualRefresh() {
    const refreshButton = document.getElementById("manualRefresh");

    refreshButton.addEventListener("click", async () => {
        if (hasWorkerDataPanels()) {
            await refreshDashboardData();
            return;
        }

        setRefreshButtonState(true);
        await checkBackendStatus();
        setRefreshButtonState(false);
    });
}

function startDashboardData() {
    if (!hasWorkerDataPanels()) {
        checkBackendStatus();
        setInterval(checkBackendStatus, REFRESH_INTERVAL);
        return;
    }

    refreshDashboardData();
    setInterval(refreshDashboardData, REFRESH_INTERVAL);
}

function hasWorkerDataPanels() {
    return Boolean(
        document.getElementById("statsGrid")
        || document.getElementById("workerGrid")
        || document.getElementById("chartGrid")
        || document.getElementById("departmentGrid")
        || document.getElementById("emergencyWorkerGrid")
        || document.getElementById("eventLogBody")
        || document.getElementById("reportsGrid")
        || document.querySelector(".loading-state")
    );
}

async function refreshDashboardData() {
    setRefreshButtonState(true);

    if (!hasLoadedOnce) {
        setLoadingState(true);
    }

    try {
        await SafetyApi.getHealth();
        const workers = await SafetyApi.getWorkers();
        const events = shouldUseBackendEventHistory()
            ? await SafetyApi.getEvents()
            : null;

        allWorkers = normaliseWorkers(Array.isArray(workers) ? workers : []);
        detectWorkerChanges(allWorkers);

        if (Array.isArray(events)) {
            eventLogRecords = normaliseEvents(events);
        } else {
            addEventLogRecords(allWorkers);
        }

        hasLoadedOnce = true;

        setBackendStatus(true);
        setLoadingState(false);
        renderAllViews();
    } catch (error) {
        console.warn("Backend unavailable:", error.message);
        setBackendStatus(false);
        setLoadingState(false);

        if (!hasLoadedOnce) {
            allWorkers = [];
            renderAllViews();
        }
    } finally {
        setRefreshButtonState(false);
    }
}

async function checkBackendStatus() {
    try {
        await SafetyApi.getHealth();
        setBackendStatus(true);
    } catch (error) {
        setBackendStatus(false);
    }
}

function normaliseWorkers(workers) {
    return workers.map((worker) => ({
        workerId: worker.workerId || worker.worker_id || "--",
        name: worker.workerName || worker.name || "Unknown Worker",
        department: worker.department || "Unassigned",
        shift: worker.shift || "--",
        temperature: Number(worker.temperature || 0),
        heartRate: Number(worker.heartRate || worker.heart_rate || 0),
        humidity: Number(worker.humidity || 0),
        gas: Number(worker.gas || worker.gasLevel || 0),
        motion: worker.motion || "--",
        scenario: worker.scenario || "Normal Operation",
        riskLevel: normaliseRisk(worker.riskLevel || worker.risk_level || "Normal"),
        emergency: Boolean(worker.emergency),
        processedAt: worker.processedAt || worker.timestamp || new Date().toISOString()
    }));
}

function normaliseEvents(events) {
    return normaliseWorkers(events).map((event) => ({
        ...event,
        logId: `${event.workerId}-${event.processedAt}`
    }));
}

function shouldUseBackendEventHistory() {
    return Boolean(
        document.getElementById("eventLogBody")
        || document.getElementById("reportsGrid")
        || document.getElementById("emergencyTimeline")
    );
}

function normaliseRisk(riskLevel) {
    const value = String(riskLevel).toLowerCase();

    if (value === "critical") {
        return "Critical";
    }

    if (value === "warning") {
        return "Warning";
    }

    return "Normal";
}

function addEventLogRecords(workers) {
    const newRecords = workers.map((worker) => ({
        workerId: worker.workerId,
        name: worker.name,
        department: worker.department,
        shift: worker.shift,
        temperature: worker.temperature,
        heartRate: worker.heartRate,
        humidity: worker.humidity,
        gas: worker.gas,
        motion: worker.motion,
        scenario: worker.scenario,
        riskLevel: worker.riskLevel,
        emergency: worker.emergency,
        processedAt: worker.processedAt,
        logId: `${worker.workerId}-${worker.processedAt}`
    }));

    eventLogRecords = newRecords.concat(eventLogRecords);
    eventLogRecords = removeDuplicateEvents(eventLogRecords).slice(0, 100);
}

function removeDuplicateEvents(records) {
    const seen = {};

    return records.filter((record) => {
        if (seen[record.logId]) {
            return false;
        }

        seen[record.logId] = true;
        return true;
    });
}

function detectWorkerChanges(workers) {
    if (!hasLoadedOnce) {
        previousWorkerStates = buildWorkerStateMap(workers);
        return;
    }

    workers.forEach((worker) => {
        const previous = previousWorkerStates[worker.workerId];

        if (!previous) {
            return;
        }

        if (previous.riskLevel !== worker.riskLevel) {
            showNotification(`${worker.name} moved from ${previous.riskLevel} to ${worker.riskLevel}`);
        }

        if (!previous.emergency && worker.emergency) {
            showNotification(`Emergency detected for ${worker.name}`);
        }
    });

    previousWorkerStates = buildWorkerStateMap(workers);
}

function buildWorkerStateMap(workers) {
    return workers.reduce((stateMap, worker) => {
        stateMap[worker.workerId] = {
            riskLevel: worker.riskLevel,
            emergency: worker.emergency
        };

        return stateMap;
    }, {});
}

function getDashboardSnapshotWorkers(workers) {
    const criticalWorkers = workers.filter((worker) => worker.riskLevel === "Critical").slice(0, 2);
    const warningWorkers = workers.filter((worker) => worker.riskLevel === "Warning").slice(0, 2);
    const normalWorkers = workers.filter((worker) => worker.riskLevel === "Normal").slice(0, 2);

    return criticalWorkers.concat(warningWorkers, normalWorkers);
}

function renderAllViews() {
    renderStats(allWorkers);
    renderWorkerCards("dashboardWorkerGrid", "dashboardEmptyState", getDashboardSnapshotWorkers(allWorkers));
    renderLiveMonitoring();
    renderAnalyticsCharts();
    renderDepartments();
    renderEmergencyCentre();
    renderEventLogs();
    renderReports();
}

function renderAnalyticsCharts() {
    const chartGrid = document.getElementById("chartGrid");

    if (!chartGrid || typeof SafetyCharts === "undefined") {
        return;
    }

    if (!allWorkers.length) {
        showElement("analyticsEmptyState");
        return;
    }

    hideElement("analyticsEmptyState");
    SafetyCharts.updateCharts(allWorkers);
}

function renderDepartments() {
    const departmentGrid = document.getElementById("departmentGrid");

    if (!departmentGrid) {
        return;
    }

    if (!allWorkers.length) {
        departmentGrid.innerHTML = "";
        showElement("departmentEmptyState");
        return;
    }

    hideElement("departmentEmptyState");
    departmentGrid.innerHTML = DEPARTMENTS.map((department) => {
        const workers = allWorkers.filter((worker) => worker.department === department);
        const warningCount = workers.filter((worker) => worker.riskLevel === "Warning").length;
        const criticalCount = workers.filter((worker) => worker.riskLevel === "Critical").length;
        const emergencyCount = workers.filter((worker) => worker.emergency).length;
        const status = getDepartmentStatus(warningCount, criticalCount, emergencyCount);

        return `
            <article class="department-card">
                <div class="department-card-top">
                    <h3>${department}</h3>
                    <span class="badge ${getRiskClass(status)}">${status}</span>
                </div>
                <div class="department-metrics">
                    <div><span>Workers</span><strong>${workers.length}</strong></div>
                    <div><span>Avg Temp</span><strong>${average(workers, "temperature")} C</strong></div>
                    <div><span>Avg Heart Rate</span><strong>${average(workers, "heartRate")} bpm</strong></div>
                    <div><span>Active Alerts</span><strong>${warningCount + criticalCount}</strong></div>
                    <div><span>Emergencies</span><strong>${emergencyCount}</strong></div>
                </div>
            </article>
        `;
    }).join("");
}

function getDepartmentStatus(warningCount, criticalCount, emergencyCount) {
    if (criticalCount || emergencyCount) {
        return "Critical";
    }

    if (warningCount) {
        return "Warning";
    }

    return "Normal";
}

function renderEmergencyCentre() {
    const emergencyGrid = document.getElementById("emergencyWorkerGrid");

    if (!emergencyGrid) {
        return;
    }

    const emergencyWorkers = allWorkers.filter((worker) => worker.emergency || worker.riskLevel === "Critical");
    const criticalWorkers = allWorkers.filter((worker) => worker.riskLevel === "Critical");

    setText("currentEmergencyCount", emergencyWorkers.length);
    setText("criticalRiskCount", criticalWorkers.length);
    updateEmergencyBanner(emergencyWorkers.length > 0);
    renderWorkerCards("emergencyWorkerGrid", "emergencyEmptyState", emergencyWorkers);
    renderEmergencyHistory();
}

function updateEmergencyBanner(hasEmergency) {
    const banner = document.getElementById("emergencyBanner");

    if (!banner) {
        return;
    }

    const currentEmergencySignature = getEmergencySignature(allWorkers);

    if (!hasEmergency) {
        emergencyBannerDismissed = false;
        dismissedEmergencySignature = "";
    }

    const wasDismissedForCurrentCases = emergencyBannerDismissed
        && dismissedEmergencySignature === currentEmergencySignature;

    if (hasEmergency && !wasDismissedForCurrentCases) {
        banner.classList.remove("hidden");
        return;
    }

    banner.classList.add("hidden");
}

function getEmergencySignature(workers) {
    return workers
        .filter((worker) => worker.emergency || worker.riskLevel === "Critical")
        .map((worker) => worker.workerId)
        .sort()
        .join("|");
}

function renderEmergencyHistory() {
    const timeline = document.getElementById("emergencyTimeline");

    if (!timeline) {
        return;
    }

    const emergencyRows = eventLogRecords
        .filter((record) => record.emergency || record.riskLevel === "Critical")
        .slice(0, 8);

    if (!emergencyRows.length) {
        timeline.innerHTML = `<div class="timeline-empty">No emergency history available</div>`;
        return;
    }

    timeline.innerHTML = emergencyRows.map((record) => `
        <article class="timeline-item">
            <div class="timeline-time">${formatTime(record.processedAt)}</div>
            <div class="timeline-body">
                <strong>Worker ${escapeHtml(record.workerId)} - ${escapeHtml(record.name)}</strong>
                <span>${escapeHtml(record.scenario)} - ${escapeHtml(record.department)}</span>
            </div>
            <span class="badge ${getRiskClass(record.riskLevel)}">${record.riskLevel}</span>
        </article>
    `).join("");
}

function renderEventLogs() {
    const eventLogBody = document.getElementById("eventLogBody");

    if (!eventLogBody) {
        return;
    }

    if (!eventLogRecords.length) {
        eventLogBody.innerHTML = "";
        showElement("logsEmptyState");
        return;
    }

    hideElement("logsEmptyState");
    eventLogBody.innerHTML = eventLogRecords.slice(0, 50).map((record) => `
        <tr>
            <td>${formatDateTime(record.processedAt)}</td>
            <td>${escapeHtml(record.workerId)}</td>
            <td>${escapeHtml(record.name)}</td>
            <td>${escapeHtml(record.department)}</td>
            <td><span class="badge ${getRiskClass(record.riskLevel)}">${record.riskLevel}</span></td>
            <td>${record.emergency ? "Yes" : "No"}</td>
            <td>${record.temperature.toFixed(1)} C</td>
            <td>${record.heartRate} bpm</td>
            <td>${record.gas} ppm</td>
            <td>${escapeHtml(record.motion)}</td>
        </tr>
    `).join("");
}

function renderReports() {
    const reportsGrid = document.getElementById("reportsGrid");

    if (!reportsGrid) {
        return;
    }

    const warningCount = allWorkers.filter((worker) => worker.riskLevel === "Warning").length;
    const criticalCount = allWorkers.filter((worker) => worker.riskLevel === "Critical").length;
    const emergencyCount = allWorkers.filter((worker) => worker.emergency).length;
    const emergencyEventCount = eventLogRecords.filter((record) => record.emergency).length;
    const latestEvent = eventLogRecords[0];
    const highestRiskDepartment = getHighestRiskDepartment();

    setReportCard("dailySafetyReport", "Today's Shift Summary", [
        ["Workers Monitored", allWorkers.length],
        ["Average Temperature", `${average(allWorkers, "temperature")} C`],
        ["Critical Alerts", criticalCount],
        ["Warnings", warningCount],
        ["Current Shift", getCurrentShift()],
        ["Generated Time", formatTime(new Date().toISOString())]
    ]);

    setReportCard("incidentSummaryReport", "Incident Summary", [
        ["Emergency cases", emergencyEventCount],
        ["Logged events", eventLogRecords.length],
        ["Current status", emergencyCount ? "Emergency active" : "Stable"],
        ["Most recent scenario", latestEvent ? latestEvent.scenario : "--"]
    ]);

    setReportCard("departmentSummaryReport", "Department Summary", [
        ["Departments monitored", DEPARTMENTS.length],
        ["Highest risk area", highestRiskDepartment],
        ["Average temperature", `${average(allWorkers, "temperature")} C`],
        ["Average heart rate", `${average(allWorkers, "heartRate")} bpm`]
    ]);

    setReportCard("workerStatisticsReport", "Worker Statistics", [
        ["Average gas level", `${average(allWorkers, "gas")} ppm`],
        ["Average humidity", `${average(allWorkers, "humidity")}%`],
        ["Active workers", allWorkers.length],
        ["Normal workers", allWorkers.filter((worker) => worker.riskLevel === "Normal").length]
    ]);
}

function setReportCard(cardId, title, rows) {
    const card = document.getElementById(cardId);

    if (!card) {
        return;
    }

    card.innerHTML = `
        <h3>${title}</h3>
        <div class="report-metrics">
            ${rows.map((row) => `
                <div>
                    <span>${row[0]}</span>
                    <strong>${escapeHtml(String(row[1]))}</strong>
                </div>
            `).join("")}
        </div>
    `;
}

function getHighestRiskDepartment() {
    const departmentScores = DEPARTMENTS.map((department) => {
        const workers = allWorkers.filter((worker) => worker.department === department);
        const score = workers.reduce((total, worker) => {
            if (worker.riskLevel === "Critical") {
                return total + 3;
            }

            if (worker.riskLevel === "Warning") {
                return total + 1;
            }

            return total;
        }, 0);

        return { department, score };
    });

    departmentScores.sort((a, b) => b.score - a.score);
    return departmentScores[0] && departmentScores[0].score > 0 ? departmentScores[0].department : "None";
}

function getCurrentShift() {
    if (!allWorkers.length) {
        return "--";
    }

    const shifts = allWorkers.reduce((list, worker) => {
        if (list.indexOf(worker.shift) === -1) {
            list.push(worker.shift);
        }

        return list;
    }, []);

    return shifts.join(", ");
}

function showNotification(message) {
    let container = document.getElementById("notificationStack");

    if (!container) {
        container = document.createElement("div");
        container.id = "notificationStack";
        container.className = "notification-stack";
        document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    notification.className = "live-notification";
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("fade-out");
    }, 3500);

    setTimeout(() => {
        notification.remove();
    }, 4300);
}

function exportEventLogsCsv() {
    if (!eventLogRecords.length) {
        setText("reportNote", "No event log data is available to export yet.");
        return;
    }

    const header = [
        "Timestamp",
        "Worker ID",
        "Worker Name",
        "Department",
        "Risk Level",
        "Emergency",
        "Temperature",
        "Heart Rate",
        "Gas Level",
        "Motion"
    ];

    const rows = eventLogRecords.map((record) => [
        formatDateTime(record.processedAt),
        record.workerId,
        record.name,
        record.department,
        record.riskLevel,
        record.emergency ? "Yes" : "No",
        record.temperature.toFixed(1),
        record.heartRate,
        record.gas,
        record.motion
    ]);

    const csvContent = [header].concat(rows)
        .map((row) => row.map(formatCsvCell).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `worker-safety-events-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    setText("reportNote", "CSV export generated from the current event log.");
}

function formatCsvCell(value) {
    const text = String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function setText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderLiveMonitoring() {
    const workerGrid = document.getElementById("workerGrid");

    if (!workerGrid) {
        return;
    }

    renderWorkerCards("workerGrid", "workerEmptyState", getFilteredWorkers());
}

function getFilteredWorkers() {
    const nameQuery = getFieldValue("workerNameSearch").toLowerCase();
    const idQuery = getFieldValue("workerIdSearch").toLowerCase();
    const department = getFieldValue("departmentFilter");
    const riskLevel = getFieldValue("riskFilter");

    return allWorkers.filter((worker) => {
        const matchesName = worker.name.toLowerCase().includes(nameQuery);
        const matchesId = worker.workerId.toLowerCase().includes(idQuery);
        const matchesDepartment = !department || worker.department === department;
        const matchesRisk = !riskLevel || worker.riskLevel === riskLevel;

        return matchesName && matchesId && matchesDepartment && matchesRisk;
    });
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);

    if (!field) {
        return "";
    }

    return field.value.trim();
}

function renderStats(workers) {
    const statsGrid = document.getElementById("statsGrid");

    if (!statsGrid) {
        return;
    }

    if (!workers.length) {
        statsGrid.innerHTML = "";
        showElement("dashboardEmptyState");
        return;
    }

    const stats = buildStats(workers);

    statsGrid.innerHTML = stats.map((stat) => `
        <article class="stat-card">
            <div class="stat-top">
                <span class="stat-icon">${stat.icon}</span>
            </div>
            <h3>${stat.title}</h3>
            <p class="stat-value">${stat.value}</p>
            <p class="stat-description">${stat.description}</p>
        </article>
    `).join("");
}

function buildStats(workers) {
    const totalWorkers = workers.length;
    const warningWorkers = workers.filter((worker) => worker.riskLevel === "Warning").length;
    const criticalWorkers = workers.filter((worker) => worker.riskLevel === "Critical").length;
    const emergencyCount = workers.filter((worker) => worker.emergency).length;

    return [
        { icon: "👷", title: "Total Workers", value: totalWorkers, description: "Workers registered in the current shift" },
        { icon: "●", title: "Active Workers", value: totalWorkers, description: "Workers sending live sensor readings" },
        { icon: "!", title: "Workers in Warning State", value: warningWorkers, description: "Workers requiring supervisor attention" },
        { icon: "!!", title: "Workers in Critical State", value: criticalWorkers, description: "High risk readings detected by fog node" },
        { icon: "⚠", title: "Emergencies Today", value: emergencyCount, description: "Emergency cases detected during the shift" },
        { icon: "🌡", title: "Average Temperature", value: `${average(workers, "temperature")} C`, description: "Average body/environment reading" },
        { icon: "♥", title: "Average Heart Rate", value: `${average(workers, "heartRate")} bpm`, description: "Average worker heart rate" },
        { icon: "☁", title: "Average Gas Level", value: `${average(workers, "gas")} ppm`, description: "Average gas sensor level" },
        { icon: "💧", title: "Average Humidity", value: `${average(workers, "humidity")}%`, description: "Average humidity across workers" },
        { icon: "↻", title: "Last System Update", value: formatTime(getLatestUpdate(workers)), description: "Latest fog node processing timestamp" }
    ];
}

function getLatestUpdate(workers) {
    const updates = workers
        .map((worker) => worker.processedAt)
        .sort();

    return updates[updates.length - 1];
}

function average(workers, fieldName) {
    if (!workers.length) {
        return "0.0";
    }

    const total = workers.reduce((sum, worker) => sum + Number(worker[fieldName] || 0), 0);
    return (total / workers.length).toFixed(1);
}

function renderWorkerCards(containerId, emptyStateId, workers) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById(emptyStateId);

    if (!container) {
        return;
    }

    if (!workers.length) {
        container.innerHTML = "";
        if (emptyState) {
            emptyState.classList.remove("hidden");
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add("hidden");
    }
    container.innerHTML = workers.map(createWorkerCard).join("");
}

function showElement(elementId) {
    const element = document.getElementById(elementId);

    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);

    if (element) {
        element.classList.add("hidden");
    }
}

function createWorkerCard(worker) {
    const riskClass = getRiskClass(worker.riskLevel);

    return `
        <article class="worker-card">
            <div class="worker-card-header">
                <div>
                    <h3>${worker.name}</h3>
                    <p class="worker-meta">${worker.workerId} - ${worker.department}</p>
                </div>
                <div class="worker-badges">
                    <span class="badge ${riskClass}">${worker.riskLevel}</span>
                    ${worker.emergency ? '<span class="badge badge-emergency">! Emergency</span>' : ''}
                </div>
            </div>

            <div class="sensor-grid">
                <div class="sensor-item"><span>Temperature</span><strong>${worker.temperature.toFixed(1)} C</strong></div>
                <div class="sensor-item"><span>Heart Rate</span><strong>${worker.heartRate} bpm</strong></div>
                <div class="sensor-item"><span>Humidity</span><strong>${worker.humidity}%</strong></div>
                <div class="sensor-item"><span>Gas Level</span><strong>${worker.gas} ppm</strong></div>
            </div>

            <div class="worker-details">
                <div class="detail-row"><span>Shift</span><strong>${worker.shift}</strong></div>
                <div class="detail-row"><span>Motion Status</span><strong>${worker.motion}</strong></div>
                <div class="detail-row"><span>Current Scenario</span><strong>${worker.scenario}</strong></div>
                <div class="detail-row"><span>Emergency Status</span><strong>${worker.emergency ? "Active" : "Clear"}</strong></div>
                <div class="detail-row"><span>Last Updated</span><strong>${formatDateTime(worker.processedAt)}</strong></div>
            </div>
        </article>
    `;
}

function getRiskClass(riskLevel) {
    if (riskLevel === "Critical") {
        return "badge-critical";
    }

    if (riskLevel === "Warning") {
        return "badge-warning";
    }

    return "badge-normal";
}

function setLoadingState(isLoading) {
    const loadingElements = [
        document.getElementById("dashboardLoading"),
        document.getElementById("workerLoading"),
        document.getElementById("analyticsLoading"),
        document.getElementById("departmentsLoading"),
        document.getElementById("emergencyLoading"),
        document.getElementById("logsLoading"),
        document.getElementById("reportsLoading")
    ].filter(Boolean);

    loadingElements.forEach((element) => {
        element.classList.toggle("hidden", !isLoading);
    });
}

function setBackendStatus(isOnline) {
    const backendStatus = document.getElementById("backendStatus");

    if (!backendStatus) {
        return;
    }

    backendStatus.classList.remove("backend-checking", "backend-online", "backend-offline");
    backendStatus.classList.add(isOnline ? "backend-online" : "backend-offline");
    backendStatus.innerHTML = `<span class="status-dot"></span>${isOnline ? "Backend Online" : "Backend Offline"}`;
}

function setRefreshButtonState(isRefreshing) {
    const refreshButton = document.getElementById("manualRefresh");

    if (!refreshButton) {
        return;
    }

    refreshButton.disabled = isRefreshing;
    refreshButton.textContent = isRefreshing ? "Refreshing" : "Refresh";
}

function formatTime(value) {
    if (!value) {
        return "--";
    }

    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDateTime(value) {
    if (!value) {
        return "--";
    }

    return new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}
