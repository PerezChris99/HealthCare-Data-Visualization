# Full-Stack Smart Healthcare Data Visualization

## Overview
This project is a full-stack web application designed for visualizing patient health data. It utilizes Flask for the backend and Vanilla JavaScript for the frontend, providing a user-friendly interface for both doctors and patients.

## Key Features
- **User Authentication**: Secure sign-up, login, and logout functionalities with password encryption.
- **User Dashboard**: Role-based access for doctors and patients, with profile management.
- **Patient Health Data Management**: CRUD operations for patient health data.
- **Data Visualization**: Interactive charts to visualize health metrics using Chart.js or D3.js.
- **Notifications**: Real-time alerts for critical health metrics.
- **Search Functionality**: Search patients and health metrics efficiently.
- **Responsive Design**: Fully responsive layout for desktop, tablet, and mobile devices.
- **Security**: Input validation, HTTPS support, and access control.

## Technical Stack
- **Backend**: Flask (Python), SQLite/PostgreSQL, Flask-SQLAlchemy, Flask-Login, Flask-CORS
- **Frontend**: HTML, CSS, Vanilla JavaScript, Chart.js/D3.js

## Project Structure
```
healthcare-app
├── backend
│   ├── app.py
│   ├── models.py
│   ├── routes.py
│   ├── forms.py
│   ├── config.py
│   └── requirements.txt
├── frontend
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── charts.js
├── tests
│   ├── test_models.py
│   └── test_routes.py
├── README.md
└── .gitignore
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd healthcare-app
   ```

2. **Set up the backend**:
   - Navigate to the `backend` directory.
   - Install the required packages:
     ```
     pip install -r requirements.txt
     ```
   - Run the Flask application:
     ```
     python app.py
     ```

3. **Set up the frontend**:
   - Open `index.html` in a web browser to view the application.

## Usage
- **User Registration**: Navigate to the sign-up page to create an account.
- **Login**: Use your credentials to log in and access the dashboard.
- **Data Management**: Doctors can add, edit, or delete patient data.
- **Visualization**: Select a patient or time range to view health data in charts.
- **Notifications**: Check for real-time alerts on critical health metrics.

## Testing
- Unit tests for backend models and routes are located in the `tests` directory. Run tests using:
  ```
  pytest
  ```

## License
This project is licensed under the MIT License. See the LICENSE file for more details.