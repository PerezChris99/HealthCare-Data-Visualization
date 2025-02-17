const ctx = document.getElementById('healthDataChart').getContext('2d');

function renderHealthDataChart(labels, data) {
    const healthDataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Heart Rate',
                data: data.heartRate,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1,
                fill: true,
            }, {
                label: 'Blood Pressure',
                data: data.bloodPressure,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function fetchHealthData(patientId) {
    const response = await fetch(`/patient-data/${patientId}`);
    const data = await response.json();
    const labels = data.map(entry => entry.date);
    const healthData = {
        heartRate: data.map(entry => entry.heartRate),
        bloodPressure: data.map(entry => entry.bloodPressure)
    };
    renderHealthDataChart(labels, healthData);
}

// Call fetchHealthData with the appropriate patient ID when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const patientId = /* logic to get patient ID */;
    fetchHealthData(patientId);
});