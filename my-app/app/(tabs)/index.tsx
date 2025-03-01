// app/auth.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';

// Type definitions
interface UserData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// API services
const API_URL = 'https://your-api-endpoint.com';

const authService = {
  login: async (email: string, password: string): Promise<UserData> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (name: string, email: string, password: string): Promise<UserData> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
};

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleAuthMode = (): void => {
    setIsLogin(!isLogin);
    // Clear fields when switching between login and signup
    setName('');
    setEmail('');
    setPassword('');
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Validation Error', 'Password is required');
      return false;
    }
    
    if (!isLogin && !name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    
    // Password strength validation
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    console.log("clicked");
    router.replace('/trip');

    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Handle login
        const userData = await authService.login(email, password);
        // Store user data or token in your app's state management (e.g., AsyncStorage)
        console.log('Login successful:', userData);
        // Navigate to main app screen
        router.replace('/trip');
      } else {
        // Handle registration
        const userData = await authService.register(name, email, password);
        console.log('Registration successful:', userData);
        // Either automatically log the user in or switch to login mode
        setIsLogin(true);
        Alert.alert('Success', 'Registration successful! Please log in.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.headerText}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subHeaderText}>
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </Text>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Example of using Link from expo-router */}
          <View style={styles.expoRouterLinks}>
            <Text style={styles.linksHeader}>Quick Links:</Text>
            
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  expoRouterLinks: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  linksHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  expoLink: {
    color: '#3498db',
    fontSize: 16,
    marginBottom: 8,
  },
});

