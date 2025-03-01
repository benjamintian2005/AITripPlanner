from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Example route
@app.route('/health', methods=['GET'])
def get_data():
    return jsonify({"status": "ok"})
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
