from flask import Flask, jsonify, request, session
from flask_cors import CORS
from datetime import datetime

import boto3
import uuid
import requests
import os


from helper import print_exception, hash_password, verify_password

if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.secret_key = os.environ.get('SESSION_SECRET_KEY')  # Configure secret key for session management

# Initialize DynamoDB resource
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id= os.environ.get('AWS_ACCESS_KEY'),    #store as env variable
    aws_secret_access_key= os.environ.get('AWS_SECRET'),    #store as env variable

    region_name='us-east-2'
)


users_table = dynamodb.Table('users')
surveys_table = dynamodb.Table('user_survey')
trips_table = dynamodb.Table('trips')
events_table = dynamodb.Table('events')
feedback_table = dynamodb.Table('feedback')



CLAUDE_API_KEY = os.environ.get('CLAUDE_API_KEY')   #env variable

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_MODEL = "claude-3-7-sonnet-20250219"  # Use the latest model available


@app.route('/health', methods=['GET'])
def get_health():
    return jsonify({"status": "ok"})

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        gender = data.get('gender')
        age = data.get('age')
        ethnicity = data.get('ethnicity')
        
        # Check if user exists
        response = users_table.get_item(Key={'username': username})
        if 'Item' in response:
            return jsonify({"error": "User already exists"}), 400
        
        # Create user with hashed password
        hashed_password = hash_password(password)
        user_data = {
            'username': username, 
            'password': hashed_password,
            'created_at': datetime.now().isoformat(),
            'gender': gender,
            'age': age,
            'ethnicity': ethnicity
        }
        
        users_table.put_item(Item=user_data)
        return jsonify({"status": "ok", "message": "User created successfully"})
    
    except Exception as e:
        print("Error logging in")
        print_exception(e)
        return jsonify({"error": "Internal server error"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data['username']
        password = data['password']
        session['username'] = username
        
        # Get user from database
        response = users_table.get_item(Key={'username': username})
        if 'Item' not in response:
            return jsonify({"error": "User does not exist"}), 404
        
        # Verify password
        stored_password = response['Item']['password']
        if not verify_password(stored_password, password):
            return jsonify({"error": "Invalid password"}), 401
        
        return jsonify({"status": "ok", "message": "Logged in successfully"})
    
    except Exception as e:
        print("Error logging in")
        print_exception(e)
        return jsonify({"error": "Internal server error"}), 500



@app.route('/user-survey', methods=['POST'])
def user_survey():
    try:
        data = request.json
        username = data['username']
        gender = data.get('gender')
        age = data.get('age')
        ethnicity = data.get('ethnicity')
        
        # Store survey data
        survey_data = {
            'username': username,
            'survey_id': str(uuid.uuid4()),
            'created_at': datetime.now().isoformat()
        }
        
        if gender:
            survey_data['gender'] = gender
        if age:
            survey_data['age'] = age
        if ethnicity:
            survey_data['ethnicity'] = ethnicity
            
        surveys_table.put_item(Item=survey_data)
        
        return jsonify({"status": "ok", "message": "Survey submitted successfully"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def call_claude_api(prompt):
    """
    Call the Claude API with a specific prompt
    """
    try:
        headers = {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": CLAUDE_MODEL,
            "max_tokens": 2000,
            "messages": [{"role": "user", "content": prompt}]
        }
        
        response = requests.post(CLAUDE_API_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        return response.json()["content"][0]["text"]
    
    except Exception as e:
        print(f"Error calling Claude API: {str(e)}")
        return None

def generate_event_with_claude(user_profile, trip_details, current_location, mood=None, previous_events=None):
    """
    Generate a personalized event recommendation using Claude
    """
    # Construct the prompt for Claude
    prompt = f"""
    You are TripAdapt, a service that tailors activity recommendations based on the type of vacation, the people involved, the user's ratings of previous events, and the user's mood. 
    Here is the user information:

    User Profile:
    - Gender: {user_profile.get('gender', 'Not specified')}
    - Age: {user_profile.get('age', 'Not specified')}
    - Ethnicity: {user_profile.get('ethnicity', 'Not specified')}

    Trip Details:
    - Budget: ${trip_details.get('budget', 'Not specified')}
    - Group Type: {trip_details.get('group_type', 'Not specified')}
    - Group Size: {trip_details.get('group_size', 'Not specified')}
    - Duration: {trip_details.get('duration_days', 'Not specified')} days
    - Location: {trip_details.get('trip_location', 'Not specified')}
    - Child Friendly: {trip_details.get('child_friendly', False)}

    Current Location: {current_location}
    Current Mood: {mood if mood else 'Not specified'}
    
    Previous Events: {previous_events if previous_events else 'No previous events'}

    Please provide ONE detailed event recommendation in the following format:
    - Name: [Event Name]
    - Description: [Event Description, limited to 50 words]
    - Location: [Event Location]
    """
    
    # Call Claude API
    try:
        claude_response = call_claude_api(prompt)
        
        if not claude_response:
            raise Exception("Failed to get a response from Claude API")
        
        # Extract event details from Claude's response
        # This is a basic parser - you might need to improve this based on Claude's actual output format
        lines = claude_response.strip().split('\n')
        event = {}
        
        for line in lines:
            if line.startswith('- Name:'):
                event['name'] = line.replace('- Name:', '').strip()
            elif line.startswith('- Description:'):
                event['description'] = line.replace('- Description:', '').strip()
            elif line.startswith('- Location:'):
                event['location'] = line.replace('- Location:', '').strip()
        
        return event
    
    except Exception as e:
        print(f"Error generating event with Claude: {str(e)}")
        # Fallback to basic event
        return {
            "name": "Local Exploration",
            "image_url": "https://example.com/images/exploration.jpg",
            "description": "Explore the local area and discover hidden gems.",
            "location": "Nearby your current location",
            "duration": "60-90 minutes",
            "cost": "Free or minimal cost"
        }

@app.route('/start-trip', methods=['POST'])
def start_trip():
    try:
        data = request.json
        username = data['username']
        budget = data['budget']
        group_type = data['type_of_group']
        group_size = data['group_size']
        duration_days = data['duration_of_trip']
        trip_location = data['trip_location']
        current_location = data['current_location']
        child_friendly = data.get('child_friendly', False)
        
        # Get user profile
        user_response = users_table.get_item(Key={'username': username})
        user_profile = user_response.get('Item', {})
        
        # Generate trip ID
        trip_id = str(uuid.uuid4())
        
        # Store trip data
        trip_data = {
            'trip_id': trip_id,
            'username': username,
            'budget': budget,
            'group_type': group_type,
            'group_size': group_size,
            'duration_days': duration_days,
            'trip_location': trip_location,
            'current_location': current_location,
            'child_friendly': child_friendly,
            'created_at': datetime.now().isoformat(),
            'status': 'active'
        }
        
        trips_table.put_item(Item=trip_data)
        
        # Generate initial event recommendation using Claude
        initial_event = generate_event_with_claude(
            user_profile=user_profile,
            trip_details=trip_data,
            current_location=current_location
        )
        
        # Store event
        event_data = {
            'event_id': str(uuid.uuid4()),
            'trip_id': trip_id,
            'event_details': initial_event,
            'sequence': 1,
            'created_at': datetime.now().isoformat(),
            'status': 'suggested'
        }
        
        events_table.put_item(Item=event_data)
        
        return jsonify({
            "status": "ok", 
            "trip_id": trip_id,
            "message": "Trip started successfully",
            "next_event": initial_event
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/next-event', methods=['POST'])
def next_event():
    try:
        data = request.json
        username = data['username']
        trip_id = data['trip_id']
        mood = data['mood']
        prev_event_rating = data.get('prev_event_rating')
        current_location = data['current_location']
        
        # Get user profile
        user_response = users_table.get_item(Key={'username': username})
        user_profile = user_response.get('Item', {})
        
        # Get trip details
        trip_response = trips_table.get_item(Key={'trip_id': trip_id})
        if 'Item' not in trip_response:
            return jsonify({"error": "Trip not found"}), 404
        
        trip = trip_response['Item']
        
        # Get previous events (in a real app, you'd query for all events for this trip)
        # For simplicity, we'll just create a summary
        previous_events = "The user previously visited a local attraction and rated it as " + (prev_event_rating or "unknown")
        
        # Store feedback
        feedback_data = {
            'feedback_id': str(uuid.uuid4()),
            'trip_id': trip_id,
            'username': username,
            'mood': mood,
            'prev_event_rating': prev_event_rating,
            'current_location': current_location,
            'created_at': datetime.now().isoformat()
        }
        
        feedback_table.put_item(Item=feedback_data)
        
        # Generate next event recommendation based on feedback using Claude
        next_event_suggestion = generate_event_with_claude(
            user_profile=user_profile,
            trip_details=trip,
            current_location=current_location,
            mood=mood,
            previous_events=previous_events
        )
        
        # Get the last sequence number and increment
        # In a real app, you'd query for the highest sequence for this trip
        sequence = 2  # Simplified for this example
        
        # Store event
        event_data = {
            'event_id': str(uuid.uuid4()),
            'trip_id': trip_id,
            'event_details': next_event_suggestion,
            'sequence': sequence,
            'created_at': datetime.now().isoformat(),
            'status': 'suggested'
        }
        
        events_table.put_item(Item=event_data)
        
        return jsonify({
            "status": "ok",
            "message": "Feedback received and next event generated",
            "next_event": next_event_suggestion
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/feedback', methods=['POST'])
def feedback():
    try:
        data = request.json
        username = data['username']
        mood = data['mood']
        prev_event_rating = data['how_was_prev_event']
        current_location = data['current_loc']
        prev_state = data.get('prev_state', {})
        
        feedback_id = str(uuid.uuid4())
        
        feedback_data = {
            'feedback_id': feedback_id,
            'username': username,
            'mood': mood,
            'prev_event_rating': prev_event_rating,
            'current_location': current_location,
            'prev_state': prev_state,
            'created_at': datetime.now().isoformat()
        }
        
        feedback_table.put_item(Item=feedback_data)
        
        return jsonify({
            "status": "ok",
            "feedback_id": feedback_id,
            "message": "Feedback submitted successfully"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    