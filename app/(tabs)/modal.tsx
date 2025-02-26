import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
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

const MyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  // State to store the review text
  const [review, setReview] = useState<string>('');
  
  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      // Replace this URL with your API endpoint that handles the review submission.
      const response = await axios.post('https://hikereview-flaskapp-546900130284.us-west1.run.app/', { review });
      
      if (response.status === 200) {
        Alert.alert('Success', 'Your review has been submitted!');
        setReview(''); // Clear the input
        onClose(); // Close the modal
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
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Submit Your Review</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your review or description"
            value={review}
            onChangeText={setReview}
            multiline
          />
          <TouchableOpacity onPress={onClose} style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity> 
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text>Close Modal</Text>
          </TouchableOpacity>
        </View>
      </View>
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
