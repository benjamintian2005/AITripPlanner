from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import boto3


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

dynamodb = boto3.resource(
    'dynamodb',
    # put access key and secret key here
    region_name='us-east-2'
)


# Example route
@app.route('/health', methods=['GET'])
def get_data():
    return jsonify({"status": "ok"})


@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data['username']
    password = data['password']
    hashed_password = generate_password_hash(password)

    table = dynamodb.Table('users')

    response = table.get_item(Key={'username': username})
    if 'Item' in response:
        return jsonify({"error": "User already exists"}), 400
    
    table.put_item(Item={'username': username, 'password': hashed_password})

    return jsonify({"status": "ok"})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    hashed_password = generate_password_hash(password)

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('users')

    response = table.get_item(Key={'username': username})
    if 'Item' not in response:
        return jsonify({"error": "User does not exist"}), 404
    
    stored_password = response['Item']['password']
    if not check_password_hash(stored_password, password):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({"status": "logged in"})


@app.route('/user-survey', methods=['POST'])
def user_survey():
    data = request.json
    username = data['username']
    survey_data = data['survey_data']
    
    return jsonify({"status": "ok"})


    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
