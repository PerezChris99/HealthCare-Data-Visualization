let currentChart = null;

// Function to render a metric chart
function renderMetricChart(canvasId, metricType, labels, data) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (currentChart && currentChart.canvas.id === canvasId) {
        currentChart.destroy();
    }
    
    // Format the labels (dates)
    const formattedLabels = labels.map(date => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString();
    });
    
    // Set chart color based on metric type
    let borderColor, backgroundColor;
    switch (metricType) {
        case 'blood_pressure':
            borderColor = '#e74c3c';
            backgroundColor = 'rgba(231, 76, 60, 0.2)';
            break;
        case 'glucose':
            borderColor = '#f39c12';
            backgroundColor = 'rgba(243, 156, 18, 0.2)';
            break;
        case 'heart_rate':
            borderColor = '#3498db';
            backgroundColor = 'rgba(52, 152, 219, 0.2)';
            break;
        default:
            borderColor = '#2ecc71';
            backgroundColor = 'rgba(46, 204, 113, 0.2)';
    }
    
    // Format y-axis title
    let yAxisTitle;
    switch (metricType) {
        case 'blood_pressure':
            yAxisTitle = 'mm Hg';
            break;
        case 'glucose':
            yAxisTitle = 'mg/dL';
            break;
        case 'heart_rate':
            yAxisTitle = 'BPM';
            break;
        default:
            yAxisTitle = 'Value';
    }
    
    // Create the chart
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedLabels,
            datasets: [{
                label: formatMetricName(metricType),
                data: data,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: yAxisTitle
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return new Date(labels[tooltipItems[0].dataIndex]).toLocaleDateString();
                        }
                    }
                },
                legend: {
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
    
    // Add threshold lines for specific metrics
    addThresholdLines(currentChart, metricType);
}

// Format metric name for display
function formatMetricName(metricType) {
    return metricType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Add threshold lines to charts
function addThresholdLines(chart, metricType) {
    // Early return if chart doesn't exist
    if (!chart) return;
    
    // Remove any existing threshold annotations
    if (chart.options.plugins.annotation) {
        chart.options.plugins.annotation.annotations = {};
    } else {
        chart.options.plugins.annotation = {
            annotations: {}
        };
    }
    
    // Add threshold lines based on metric type
    switch (metricType) {
        case 'blood_pressure':
            // Normal range: 90/60mmHg - 120/80mmHg
            chart.options.plugins.annotation.annotations.highLine = {
                type: 'line',
                yMin: 120,
                yMax: 120,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: 'High',
                    position: 'end',
                    enabled: true
                }
            };
            chart.options.plugins.annotation.annotations.normalLine = {
                type: 'line',
                yMin: 90,
                yMax: 90,
                borderColor: 'green',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: 'Normal',
                    position: 'end',
                    enabled: true
                }
            };
            break;
            
        case 'glucose':
            // Normal fasting blood sugar: 70-99 mg/dL
            chart.options.plugins.annotation.annotations.highLine = {
                type: 'line',
                yMin: 99,
                yMax: 99,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: 'High',
                    position: 'end',
                    enabled: true
                }
            };
            chart.options.plugins.annotation.annotations.lowLine = {
                type: 'line',
                yMin: 70,
                yMax: 70,
                borderColor: 'blue',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: 'Low',
                    position: 'end',
                    enabled: true
                }
            };
            break;
            
        case 'heart_rate':
            // Normal resting heart rate: 60-100 BPM
            chart.options.plugins.annotation.annotations.highLine = {
                type: 'line',
                yMin: 100,
                yMax: 100,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: 'High',
                    position: 'end',
                    enabled: true
                }
            };
            chart.options.plugins.annotation.annotations.lowLine = {
                type: 'line',
                yMin: 60,
                yMax: 60,
                borderColor: 'blue',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                    content: 'Low',
                    position: 'end',
                    enabled: true
                }
            };
            break;
    }
    
    // Update the chart
    chart.update();
}

// Check if values are in normal ranges
function isValueNormal(metricType, value) {
    switch (metricType) {
        case 'blood_pressure':
            return value >= 90 && value <= 120;
        case 'glucose':
            return value >= 70 && value <= 99;
        case 'heart_rate':
            return value >= 60 && value <= 100;
        default:
            return true;
    }
}

// Function to generate mock data for demo purposes
function generateMockData(metricType, days = 30) {
    const data = [];
    const today = new Date();
    
    for (let i = days; i > 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        let value;
        switch (metricType) {
            case 'blood_pressure':
                // Normal range: 90/60 - 120/80
                value = Math.floor(Math.random() * 40) + 80;
                break;
            case 'glucose':
                // Normal range: 70-99 mg/dL
                value = Math.floor(Math.random() * 50) + 70;
                break;
            case 'heart_rate':
                // Normal range: 60-100 BPM
                value = Math.floor(Math.random() * 50) + 60;
                break;
            default:
                value = Math.floor(Math.random() * 100);
        }
        
        data.push({
            timestamp: date,
            value: value
        });
    }
    
    return data;
}
