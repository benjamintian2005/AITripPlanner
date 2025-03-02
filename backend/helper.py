import bcrypt
import traceback

# functions to hash and verify passwords
def hash_password(password):
    # Generate a salt and hash the password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)  # Adjust rounds for security/performance
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed

def verify_password(stored_hash, provided_password):
    stored_hash = bytes(stored_hash)
    password_bytes = provided_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, stored_hash)

# Print exception details
def print_exception(e):
    print(f"Exception occurred: {e}")
    print(f"Exception type: {type(e)}")
    print(f"Exception args: {e.args}")
    print(f"Traceback: {traceback.format_exc()}")

