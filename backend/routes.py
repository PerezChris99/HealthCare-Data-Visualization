from flask import Blueprint, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Patient
from app import db

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return render_template('index.html')

@routes.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    new_user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        name=data['name'],
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@routes.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@routes.route('/patient-data', methods=['GET', 'POST', 'PUT', 'DELETE'])
def patient_data():
    if request.method == 'POST':
        data = request.get_json()
        new_patient = Patient(
            user_id=data['user_id'],
            heart_rate=data['heart_rate'],
            blood_pressure=data['blood_pressure'],
            temperature=data['temperature']
        )
        db.session.add(new_patient)
        db.session.commit()
        return jsonify({'message': 'Patient data added'}), 201

    elif request.method == 'GET':
        patients = Patient.query.all()
        return jsonify([patient.to_dict() for patient in patients]), 200

    # Additional PUT and DELETE methods would be implemented here

@routes.route('/notifications', methods=['GET'])
def notifications():
    # Logic to fetch notifications would be implemented here
    return jsonify({'notifications': []}), 200

@routes.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    patients = Patient.query.filter(Patient.name.contains(query)).all()
    return jsonify([patient.to_dict() for patient in patients]), 200