const SafetyCharts = (() => {
    const chartInstances = {};
    const chartColours = {
        normal: "#4caf50",
        warning: "#f0b429",
        critical: "#e05252",
        blueGrey: "#78909c",
        mutedLine: "#3b444e",
        text: "#c7d0dc"
    };

    function updateCharts(workers) {
        if (typeof Chart === "undefined") {
            return;
        }

        ensureCharts();

        if (!Object.keys(chartInstances).length) {
            return;
        }

        updateLineChart("temperature", getWorkerLabels(workers), getValues(workers, "temperature"));
        updateLineChart("heartRate", getWorkerLabels(workers), getValues(workers, "heartRate"));
        updateLineChart("gas", getWorkerLabels(workers), getValues(workers, "gas"));
        updateLineChart("humidity", getWorkerLabels(workers), getValues(workers, "humidity"));
        updateRiskDistribution(workers);
        updateDepartmentRisk(workers);
    }

    function ensureCharts() {
        createLineChart("temperature", "temperatureChart", "Temperature (C)", chartColours.warning);
        createLineChart("heartRate", "heartRateChart", "Heart Rate (bpm)", chartColours.blueGrey);
        createLineChart("gas", "gasChart", "Gas Level (ppm)", chartColours.critical);
        createLineChart("humidity", "humidityChart", "Humidity (%)", "#6f8f72");
        createRiskChart();
        createDepartmentRiskChart();
    }

    function createLineChart(key, canvasId, label, colour) {
        const canvas = document.getElementById(canvasId);

        if (!canvas || chartInstances[key]) {
            return;
        }

        chartInstances[key] = new Chart(canvas, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label,
                    data: [],
                    borderColor: colour,
                    backgroundColor: transparentColour(colour),
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 5,
                    tension: 0.32,
                    fill: true
                }]
            },
            options: getChartOptions()
        });
    }

    function createRiskChart() {
        const canvas = document.getElementById("riskDistributionChart");

        if (!canvas || chartInstances.riskDistribution) {
            return;
        }

        chartInstances.riskDistribution = new Chart(canvas, {
            type: "pie",
            data: {
                labels: ["Normal", "Warning", "Critical"],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        chartColours.normal,
                        chartColours.warning,
                        chartColours.critical
                    ],
                    borderColor: "#1b1f24",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: getPluginOptions()
            }
        });
    }

    function createDepartmentRiskChart() {
        const canvas = document.getElementById("departmentRiskChart");

        if (!canvas || chartInstances.departmentRisk) {
            return;
        }

        chartInstances.departmentRisk = new Chart(canvas, {
            type: "bar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Warning",
                        data: [],
                        backgroundColor: chartColours.warning
                    },
                    {
                        label: "Critical",
                        data: [],
                        backgroundColor: chartColours.critical
                    }
                ]
            },
            options: getChartOptions(true)
        });
    }

    function updateLineChart(key, labels, values) {
        const chart = chartInstances[key];

        if (!chart) {
            return;
        }

        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.update();
    }

    function updateRiskDistribution(workers) {
        const chart = chartInstances.riskDistribution;

        if (!chart) {
            return;
        }

        chart.data.datasets[0].data = [
            countRisk(workers, "Normal"),
            countRisk(workers, "Warning"),
            countRisk(workers, "Critical")
        ];
        chart.update();
    }

    function updateDepartmentRisk(workers) {
        const chart = chartInstances.departmentRisk;

        if (!chart) {
            return;
        }

        const departments = getDepartments(workers);

        chart.data.labels = departments;
        chart.data.datasets[0].data = departments.map((department) => countDepartmentRisk(workers, department, "Warning"));
        chart.data.datasets[1].data = departments.map((department) => countDepartmentRisk(workers, department, "Critical"));
        chart.update();
    }

    function getWorkerLabels(workers) {
        return workers.map((worker) => worker.workerId);
    }

    function getValues(workers, fieldName) {
        return workers.map((worker) => Number(worker[fieldName] || 0));
    }

    function countRisk(workers, riskLevel) {
        return workers.filter((worker) => worker.riskLevel === riskLevel).length;
    }

    function getDepartments(workers) {
        return workers.reduce((departments, worker) => {
            if (departments.indexOf(worker.department) === -1) {
                departments.push(worker.department);
            }

            return departments;
        }, []);
    }

    function countDepartmentRisk(workers, department, riskLevel) {
        return workers.filter((worker) => (
            worker.department === department && worker.riskLevel === riskLevel
        )).length;
    }

    function getChartOptions(isBarChart = false) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: getPluginOptions(),
            scales: {
                x: {
                    stacked: isBarChart,
                    ticks: { color: chartColours.text },
                    grid: { color: chartColours.mutedLine }
                },
                y: {
                    stacked: isBarChart,
                    beginAtZero: true,
                    ticks: {
                        color: chartColours.text,
                        precision: 0
                    },
                    grid: { color: chartColours.mutedLine }
                }
            }
        };
    }

    function getPluginOptions() {
        return {
            legend: {
                labels: {
                    color: chartColours.text,
                    boxWidth: 14
                }
            },
            tooltip: {
                backgroundColor: "#20252b",
                borderColor: "#3b444e",
                borderWidth: 1,
                titleColor: "#f1f5f9",
                bodyColor: chartColours.text
            }
        };
    }

    function transparentColour(hexColour) {
        const red = parseInt(hexColour.substring(1, 3), 16);
        const green = parseInt(hexColour.substring(3, 5), 16);
        const blue = parseInt(hexColour.substring(5, 7), 16);

        return `rgba(${red}, ${green}, ${blue}, 0.12)`;
    }

    return {
        updateCharts
    };
})();
