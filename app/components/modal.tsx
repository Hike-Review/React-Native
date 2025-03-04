import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

/*
trail_id
username
rating
Review_text
*/

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StarRating: React.FC<{ rating: number; setRating: (rating: number) => void; }> = ({ rating, setRating }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <FontAwesome name={star <= rating ? "star" : "star-o"} size={32} color="gold" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const MyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [review, setReview] = useState<string>('');
  const [rating, setRating] = useState<number>(0);

  const handleSubmit = async () => {
    try {
      // Replace with your backend API endpoint.
      const response = await axios.post('https://your-backend.com/api/reviews', { review, rating });
      if (response.status === 200) {
        Alert.alert('Success', 'Your review has been submitted!');
        setReview('');
        setRating(0);
        onClose();
      } else {
        Alert.alert('Error', 'There was an issue submitting your review.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while submitting your review.');
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      {/* Wrapping the content in TouchableWithoutFeedback dismisses the keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Submit Your Review</Text>
            {/* Star rating section */}
            <StarRating rating={rating} setRating={setRating} />
            {/* Text input for review */}
            <TextInput
              style={styles.input}
              placeholder="Enter your review or description"
              value={review}
              onChangeText={setReview}
              multiline
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    minWidth: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
    padding: 10,
  },
});

export default MyModal;