from flask import json, Flask
from flask_testing import TestCase
from backend.app import app, db
from backend.models import User, Patient

class TestRoutes(TestCase):
    def create_app(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app

    def setUp(self):
        db.create_all()
        self.user = User(email='test@example.com', password='password', role='doctor')
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_signup(self):
        response = self.client.post('/signup', data={
            'email': 'newuser@example.com',
            'password': 'newpassword',
            'name': 'New User',
            'role': 'patient'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn(b'Success', response.data)

    def test_login(self):
        response = self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'password'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Logged in', response.data)

    def test_logout(self):
        self.client.post('/login', data={
            'email': 'test@example.com',
            'password': 'password'
        })
        response = self.client.post('/logout')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Logged out', response.data)

    def test_add_patient_data(self):
        response = self.client.post('/patient-data', json={
            'patient_id': self.user.id,
            'heart_rate': 72,
            'blood_pressure': '120/80',
            'temperature': 98.6
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn(b'Patient data added', response.data)

    def test_get_patient_data(self):
        response = self.client.get('/patient-data')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(json.loads(response.data), list)

    def test_search_patients(self):
        response = self.client.get('/search?name=test')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'test@example.com', response.data)