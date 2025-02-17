import unittest
from backend import app, db
from backend.models import User, Patient

class ModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_creation(self):
        user = User(email='test@example.com', password='password', name='Test User', role='patient')
        db.session.add(user)
        db.session.commit()
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertEqual(user.role, 'patient')

    def test_patient_creation(self):
        user = User(email='doctor@example.com', password='password', name='Doctor User', role='doctor')
        db.session.add(user)
        db.session.commit()
        
        patient = Patient(user_id=user.id, heart_rate=70, blood_pressure='120/80', temperature=98.6)
        db.session.add(patient)
        db.session.commit()
        
        self.assertEqual(patient.heart_rate, 70)
        self.assertEqual(patient.blood_pressure, '120/80')
        self.assertEqual(patient.temperature, 98.6)

    def test_user_password_hashing(self):
        user = User(email='test@example.com', password='password', name='Test User', role='patient')
        self.assertTrue(user.verify_password('password'))
        self.assertFalse(user.verify_password('wrongpassword'))

if __name__ == '__main__':
    unittest.main()