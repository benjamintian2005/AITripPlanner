import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface EmotionOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

const EventFeedbackPage: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  
  // Emotion options with emojis, labels and descriptions
  const emotions: EmotionOption[] = [
    {
      id: 'excited',
      emoji: '🤩',
      label: 'Excited',
      description: 'The event exceeded my expectations!'
    },
    {
      id: 'happy',
      emoji: '😊',
      label: 'Happy',
      description: 'I enjoyed the event and found it valuable.'
    },
    {
      id: 'neutral',
      emoji: '😐',
      label: 'Neutral',
      description: 'The event was okay, but could be improved.'
    },
    {
      id: 'disappointed',
      emoji: '😕',
      label: 'Disappointed',
      description: 'The event didn\'t meet my expectations.'
    },
    {
      id: 'frustrated',
      emoji: '😤',
      label: 'Frustrated',
      description: 'I experienced issues that affected my experience.'
    },
    {
      id: 'inspired',
      emoji: '💡',
      label: 'Inspired',
      description: 'I left with many new ideas and insights.'
    },
    {
      id: 'overwhelmed',
      emoji: '🥴',
      label: 'Overwhelmed',
      description: 'There was too much information to process.'
    },
    {
      id: 'bored',
      emoji: '🥱',
      label: 'Bored',
      description: 'The content wasn\'t engaging enough.'
    }
  ];

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
  };

  const handleSubmit = () => {
    if (selectedEmotion) {
      // Here you would typically send the feedback to your backend
      console.log('Submitted emotion feedback:', selectedEmotion);
      
      // Navigate to the thank you page
      router.replace('/EventRecommendations');
      
      // Alternatively, if you need to pass data to the next screen:
      // router.replace({
      //   pathname: '/thank-you',
      //   params: { emotion: selectedEmotion }
      // });
    } else {
      Alert.alert('Please select an emotion before submitting');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Feedback</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event logo/image */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150' }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Feedback question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            How did you feel about the Tech Innovation Summit?
          </Text>
          <Text style={styles.questionSubtext}>
            Select the emotion that best describes your overall experience
          </Text>
        </View>
        
        {/* Emotion options grid */}
        <View style={styles.emotionsGrid}>
          {emotions.map(emotion => (
            <TouchableOpacity
              key={emotion.id}
              style={[
                styles.emotionOption,
                selectedEmotion === emotion.id && styles.selectedEmotion
              ]}
              onPress={() => handleEmotionSelect(emotion.id)}
            >
              <Text style={styles.emoji}>{emotion.emoji}</Text>
              <Text style={styles.emotionLabel}>{emotion.label}</Text>
              <Text style={styles.emotionDescription}>{emotion.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Submit button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              !selectedEmotion && styles.disabledButton
            ]}
            disabled={!selectedEmotion}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40, // Same width as back button for centering the title
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  emotionOption: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedEmotion: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emotionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emotionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventFeedbackPage;