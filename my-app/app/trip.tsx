import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import * as Location from 'expo-location';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Link , router} from 'expo-router';


interface UserData {
  gender: string;
  age: string;
  ethnicity: string;
  budget: string;
  groupType: string;
  groupSize: string;
  childFriendly: boolean;
  duration: string;
  location: string;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
}

// Sample locations for the picker
const popularLocations = [
  { label: 'Select a location', value: '' },
  { label: 'New York, USA', value: 'new-york' },
  { label: 'Paris, France', value: 'paris' },
  { label: 'Tokyo, Japan', value: 'tokyo' },
  { label: 'London, UK', value: 'london' },
  { label: 'Rome, Italy', value: 'rome' },
  { label: 'Sydney, Australia', value: 'sydney' },
  { label: 'Barcelona, Spain', value: 'barcelona' },
  { label: 'Dubai, UAE', value: 'dubai' },
  { label: 'Singapore', value: 'singapore' },
  { label: 'Custom Location', value: 'custom' },
];

const InitialSurveyScreen = () => {

  const [userData, setUserData] = useState<UserData>({
    gender: '',
    age: '',
    ethnicity: '',
    budget: '',
    groupType: '',
    groupSize: '',
    childFriendly: false,
    duration: '',
    location: '',
    coordinates: {
      latitude: null,
      longitude: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState<'personal' | 'trip'>('personal');
  const [customLocationMode, setCustomLocationMode] = useState(false);
  const [selectedLocationValue, setSelectedLocationValue] = useState('');

  const ethnicityOptions = [
    'African', 'Asian', 'Caucasian', 'Hispanic/Latino', 
    'Middle Eastern', 'Native American', 'Pacific Islander', 'Other', 'Prefer not to say'
  ];

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to continue');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      let address = 'Current Location';
      if (addressResponse.length > 0) {
        const { city, region, country } = addressResponse[0];
        address = [city, region, country].filter(Boolean).join(', ');
      }

      setUserData({
        ...userData,
        location: address,
        coordinates: {
          latitude,
          longitude,
        },
      });
      setSelectedLocationValue('custom');
      setCustomLocationMode(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocationValue(value);
    
    if (value === 'custom') {
      setCustomLocationMode(true);
      // Clear existing location if switching to custom
      setUserData({
        ...userData,
        location: '',
        coordinates: {
          latitude: null,
          longitude: null,
        },
      });
    } else if (value !== '') {
      setCustomLocationMode(false);
      // Find the label for the selected location
      const selectedLocation = popularLocations.find(loc => loc.value === value);
      if (selectedLocation) {
        setUserData({
          ...userData,
          location: selectedLocation.label,
          coordinates: {
            latitude: null, // In a real app, you would have predefined coordinates
            longitude: null,
          },
        });
      }
    }
  };

  const validatePersonalInfo = () => {
    if (!userData.gender || !userData.age) {
      Alert.alert('Missing Information', 'Please fill out gender and age');
      return false;
    }
    return true;
  };

  const validateTripInfo = () => {
    if (!userData.budget || !userData.groupType || !userData.groupSize || !userData.duration || !userData.location) {
      Alert.alert('Missing Information', 'Please fill out all required trip details');
      return false;
    }
    return true;
  };

  const moveToTripSection = () => {
    if (validatePersonalInfo()) {
      setCurrentSection('trip');
    }
  };

  const submitSurvey = () => {
    if (validateTripInfo()) {
      // In a real app, you would send this data to your backend
      console.log('Survey data:', userData);
      
      // Navigate to the next screen (recommendations/events)
      router.replace('/EventRecommendations')
    }
  };

  // Render Personal Information Section
  const renderPersonalSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About You</Text>
      
      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userData.gender}
          onValueChange={(value) => setUserData({ ...userData, gender: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Non-binary" value="non-binary" />
          <Picker.Item label="Prefer not to say" value="not-specified" />
        </Picker>
      </View>

      <Text style={styles.label}>Age</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userData.age}
          onValueChange={(value) => setUserData({ ...userData, age: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Age Range" value="" />
          <Picker.Item label="Under 18" value="under-18" />
          <Picker.Item label="18-24" value="18-24" />
          <Picker.Item label="25-34" value="25-34" />
          <Picker.Item label="35-44" value="35-44" />
          <Picker.Item label="45-54" value="45-54" />
          <Picker.Item label="55-64" value="55-64" />
          <Picker.Item label="65+" value="65+" />
        </Picker>
      </View>

      <Text style={styles.label}>Ethnicity</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userData.ethnicity}
          onValueChange={(value) => setUserData({ ...userData, ethnicity: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Ethnicity" value="" />
          {ethnicityOptions.map((option, index) => (
            <Picker.Item key={index} label={option} value={option.toLowerCase()} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={moveToTripSection}>
        <Text style={styles.buttonText}>Next: Trip Details</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Trip Information Section
  const renderTripSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Trip Details</Text>
      
      <Text style={styles.label}>Budget</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userData.budget}
          onValueChange={(value) => setUserData({ ...userData, budget: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Budget" value="" />
          <Picker.Item label="Budget-friendly" value="budget" />
          <Picker.Item label="Mid-range" value="mid-range" />
          <Picker.Item label="Luxury" value="luxury" />
        </Picker>
      </View>

      <Text style={styles.label}>Type of Group</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userData.groupType}
          onValueChange={(value) => setUserData({ ...userData, groupType: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Group Type" value="" />
          <Picker.Item label="Individual" value="individual" />
          <Picker.Item label="Couple" value="couple" />
          <Picker.Item label="Friends" value="friends" />
          <Picker.Item label="Family" value="family" />
        </Picker>
      </View>

      <Text style={styles.label}>Group Size</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={userData.groupSize}
          onValueChange={(value) => setUserData({ ...userData, groupSize: value })}
          style={styles.picker}
        >
          <Picker.Item label="Select Group Size" value="" />
          <Picker.Item label="1 person" value="1" />
          <Picker.Item label="2 people" value="2" />
          <Picker.Item label="3-4 people" value="3-4" />
          <Picker.Item label="5-8 people" value="5-8" />
          <Picker.Item label="9+ people" value="9+" />
        </Picker>
      </View>

      <View style={styles.checkboxRow}>
        <CheckBox
          title="Child-friendly options needed"
          checked={userData.childFriendly}
          onPress={() => setUserData({ ...userData, childFriendly: !userData.childFriendly })}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
        />
      </View>

      <Text style={styles.label}>Trip Duration (days)</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Number of days"
        value={userData.duration}
        onChangeText={(value) => setUserData({ ...userData, duration: value })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Trip Location</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLocationValue}
          onValueChange={handleLocationChange}
          style={styles.picker}
        >
          {popularLocations.map((location) => (
            <Picker.Item 
              key={location.value} 
              label={location.label} 
              value={location.value} 
            />
          ))}
        </Picker>
      </View>

      {customLocationMode && (
        <View style={styles.locationInputContainer}>
          <TextInput
            style={[styles.textInput, styles.locationInput]}
            placeholder="Enter destination"
            value={userData.location}
            onChangeText={(value) => setUserData({ ...userData, location: value })}
          />
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Text style={styles.locationButtonText}>
              {loading ? "Loading..." : "Current"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => setCurrentSection('personal')}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => submitSurvey()}
        >
          <Link href={'/EventRecommendations'}>
            <Text style={styles.buttonText}>Find Events</Text>
          </Link>
        </TouchableOpacity>
          
          
        
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to TripAdapt</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself so we can recommend personalized experiences
          </Text>
        </View>

        {currentSection === 'personal' ? renderPersonalSection() : renderTripSection()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    padding: 0,
    marginBottom: 8,
  },
  checkboxText: {
    fontWeight: 'normal',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  locationButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#95a5a6',
    flex: 0.48,
  },
});

export default InitialSurveyScreen;