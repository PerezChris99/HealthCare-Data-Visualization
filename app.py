from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from models import db, User, Patient, HealthMetric
import config

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.from_object(config.Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Create tables
@app.before_first_request
def create_tables():
    db.create_all()

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(
            identity={
                'id': user.id, 
                'role': user.role
            },
            expires_delta=timedelta(hours=24)
        )
        return jsonify(access_token=access_token, role=user.role), 200
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered"}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    new_user = User(
        email=data['email'],
        password=hashed_password,
        role=data['role']
    )
    
    db.session.add(new_user)
    
    if data['role'] == 'patient':
        new_patient = Patient(
            user_id=new_user.id,
            name=data['name'],
            age=data['age'],
            medical_history=data.get('medical_history', '')
        )
        db.session.add(new_patient)
    
    db.session.commit()
    
    return jsonify({"msg": "User registered successfully"}), 201

@app.route('/api/patients', methods=['GET'])
@jwt_required()
def get_patients():
    current_user = get_jwt_identity()
    
    if current_user['role'] == 'doctor':
        patients = Patient.query.all()
        result = []
        for patient in patients:
            result.append({
                'id': patient.id,
                'name': patient.name,
                'age': patient.age,
                'medical_history': patient.medical_history
            })
        return jsonify(result), 200
    
    return jsonify({"msg": "Unauthorized"}), 403

@app.route('/api/patients/<int:id>', methods=['GET'])
@jwt_required()
def get_patient(id):
    current_user = get_jwt_identity()
    
    if current_user['role'] == 'doctor' or (current_user['role'] == 'patient' and Patient.query.filter_by(user_id=current_user['id']).first().id == id):
        patient = Patient.query.get(id)
        if not patient:
            return jsonify({"msg": "Patient not found"}), 404
            
        return jsonify({
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'medical_history': patient.medical_history
        }), 200
    
    return jsonify({"msg": "Unauthorized"}), 403

@app.route('/api/patients/<int:id>/metrics', methods=['GET'])
@jwt_required()
def get_patient_metrics(id):
    current_user = get_jwt_identity()
    
    if current_user['role'] == 'doctor' or (current_user['role'] == 'patient' and Patient.query.filter_by(user_id=current_user['id']).first().id == id):
        metrics = HealthMetric.query.filter_by(patient_id=id).order_by(HealthMetric.timestamp).all()
        
        result = []
        for metric in metrics:
            result.append({
                'id': metric.id,
                'type': metric.metric_type,
                'value': metric.value,
                'timestamp': metric.timestamp.isoformat()
            })
            
        return jsonify(result), 200
    
    return jsonify({"msg": "Unauthorized"}), 403

@app.route('/api/metrics', methods=['POST'])
@jwt_required()
def add_metric():
    current_user = get_jwt_identity()
    data = request.get_json()
    
    patient_id = data.get('patient_id')
    
    if current_user['role'] == 'doctor' or (current_user['role'] == 'patient' and Patient.query.filter_by(user_id=current_user['id']).first().id == patient_id):
        new_metric = HealthMetric(
            patient_id=patient_id,
            metric_type=data['type'],
            value=data['value'],
            timestamp=datetime.now()
        )
        
        db.session.add(new_metric)
        db.session.commit()
        
        return jsonify({"msg": "Metric added successfully"}), 201
    
    return jsonify({"msg": "Unauthorized"}), 403

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    
    if current_user['role'] == 'patient':
        patient = Patient.query.filter_by(user_id=current_user['id']).first()
        return jsonify({
            'id': patient.id,
            'name': patient.name,
            'age': patient.age,
            'medical_history': patient.medical_history
        }), 200
    
    return jsonify({"msg": "Profile information"}), 200

if __name__ == '__main__':
    app.run(debug=True)
