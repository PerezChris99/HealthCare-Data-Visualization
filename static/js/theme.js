document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.querySelector('.theme-label');
    const body = document.body;
    
    // Check if user has a preferred theme stored
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.checked = true;
        themeLabel.textContent = 'Light Mode';
    }
    
    // Theme toggle event listener
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeLabel.textContent = 'Light Mode';
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeLabel.textContent = 'Dark Mode';
        }
        
        // If there's an active chart, update it to match the new theme
        if (typeof currentChart !== 'undefined' && currentChart !== null) {
            currentChart.update();
        }
    });
});
