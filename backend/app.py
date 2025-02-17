from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from config import Config
from routes import routes  # Import the routes Blueprint
import os
import db

app = Flask(__name__, template_folder=os.path.join('backend', 'templates'))
app.config.from_object(Config)

db.init_app(app)

CORS(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'

app.register_blueprint(routes)  # Register the routes Blueprint

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)