import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; title: string; comment: string }) => Promise<void>;
  onCancel: () => void;
}

export default function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (title.trim().length < 3) {
      Alert.alert('Error', 'Title must be at least 3 characters');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Error', 'Comment must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Write a Review</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Rating:</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Review Title *"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Your Review *"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        maxLength={1000}
      />

      <Text style={styles.charCount}>
        {comment.length}/1000 characters
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 24,
    marginRight: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2D6A4F',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
