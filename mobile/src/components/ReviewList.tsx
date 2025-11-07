import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Review } from '../services/reviewService';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reviews yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewAuthor}>
              {review.user?.firstName} {review.user?.lastName}
            </Text>
            {review.isVerifiedPurchase && (
              <Text style={styles.verifiedBadge}>✓ Verified Purchase</Text>
            )}
          </View>

          <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>

          {review.title && (
            <Text style={styles.reviewTitle}>{review.title}</Text>
          )}

          {review.comment && (
            <Text style={styles.reviewComment}>{review.comment}</Text>
          )}

          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: 'bold',
  },
  reviewStars: {
    fontSize: 16,
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
});
