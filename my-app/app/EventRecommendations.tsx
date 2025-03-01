import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  imageUrl: string;
}

interface EventScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

const EventPage: React.FC = () => {
  // Mock data for the event
  const eventDetails = {
    title: "Tech Innovation Summit 2025",
    date: "March 15-17, 2025",
    location: "Convention Center, San Francisco",
    description: "Join us for the biggest tech innovation event of the year. Network with industry leaders, attend workshops, and discover the latest technological advancements.",
    bannerImage: "https://via.placeholder.com/600x300",
    price: "$299",
  };

  const speakers: Speaker[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Chief Technology Officer',
      company: 'FutureTech Inc.',
      imageUrl: 'https://via.placeholder.com/100',
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'AI Research Director',
      company: 'DeepMind Systems',
      imageUrl: 'https://via.placeholder.com/100',
    },
    {
      id: '3',
      name: 'Aisha Patel',
      role: 'Blockchain Specialist',
      company: 'Crypto Innovations',
      imageUrl: 'https://via.placeholder.com/100',
    },
  ];

  const schedule: EventScheduleItem[] = [
    {
      id: '1',
      time: '9:00 AM - 10:00 AM',
      title: 'Registration & Breakfast',
      description: 'Check-in at the main hall and enjoy networking breakfast',
    },
    {
      id: '2',
      time: '10:00 AM - 11:30 AM',
      title: 'Keynote: The Future of AI',
      speaker: 'Sarah Johnson',
      description: 'Exploring how artificial intelligence will shape business and society in the next decade',
    },
    {
      id: '3',
      time: '11:45 AM - 12:45 PM',
      title: 'Workshop: Blockchain Applications',
      speaker: 'Aisha Patel',
      description: 'Hands-on session demonstrating practical applications of blockchain technology',
    },
    {
      id: '4',
      time: '1:00 PM - 2:00 PM',
      title: 'Lunch Break',
      description: 'Networking lunch in the main hall',
    },
  ];

  const { width } = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: eventDetails.bannerImage }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          {/* Back button overlay */}
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Event Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{eventDetails.title}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#555" />
              <Text style={styles.detailText}>{eventDetails.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color="#555" />
              <Text style={styles.detailText}>{eventDetails.location}</Text>
            </View>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>{eventDetails.price}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{eventDetails.description}</Text>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          {schedule.map((item) => (
            <View key={item.id} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                {item.speaker && (
                  <Text style={styles.scheduleSpeaker}>Speaker: {item.speaker}</Text>
                )}
                {item.description && (
                  <Text style={styles.scheduleDescription}>{item.description}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Speakers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speakers</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speakersContainer}
          >
            {speakers.map((speaker) => (
              <View key={speaker.id} style={styles.speakerCard}>
                <Image source={{ uri: speaker.imageUrl }} style={styles.speakerImage} />
                <Text style={styles.speakerName}>{speaker.name}</Text>
                <Text style={styles.speakerRole}>{speaker.role}</Text>
                <Text style={styles.speakerCompany}>{speaker.company}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Register Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register Now</Text>
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
  scrollContent: {
    paddingBottom: 30,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    marginLeft: 6,
    color: '#555',
    fontSize: 14,
  },
  priceTag: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleTime: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  scheduleSpeaker: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  speakersContainer: {
    paddingVertical: 10,
  },
  speakerCard: {
    width: 150,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speakerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  speakerRole: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  speakerCompany: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  buttonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventPage;