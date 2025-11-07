import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { productService, Product } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { reviewService, Review } from '../../services/reviewService';
import ReviewList from '../../components/ReviewList';
import ReviewForm from '../../components/ReviewForm';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const [data, reviewsData, wishlistStatus] = await Promise.all([
        productService.getProductById(productId),
        reviewService.getProductReviews(productId, 1, 10),
        wishlistService.isInWishlist(productId),
      ]);

      setProduct(data);
      setReviews(reviewsData.reviews);
      setInWishlist(wishlistStatus);

      try {
        const userReviews = await reviewService.getUserReviews();
        const hasReviewed = userReviews.some(
          (review) => Number(review.productId) === Number(productId)
        );
        setUserHasReviewed(hasReviewed);
      } catch (error) {
        console.error('Failed to check user reviews:', error);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      Alert.alert('Error', 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await cartService.addToCart(productId, quantity);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add to cart'
      );
    }
  };

  const toggleWishlist = async () => {
    try {
      if (inWishlist) {
        const wishlist = await wishlistService.getWishlist();
        const item = wishlist.find((w) => w.productId === productId);
        if (item) {
          await wishlistService.removeFromWishlist(item.id);
        }
        setInWishlist(false);
      } else {
        await wishlistService.addToWishlist(productId);
        setInWishlist(true);
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update wishlist'
      );
    }
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    try {
      await reviewService.createReview({
        productId,
        ...data,
      });

      const updatedReviews = await reviewService.getProductReviews(productId, 1, 10);
      setReviews(updatedReviews.reviews);
      setUserHasReviewed(true);
      setShowReviewForm(false);

      Alert.alert('Success', 'Review submitted successfully!');

      const updatedProduct = await productService.getProductById(productId);
      setProduct(updatedProduct);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '';

      if (
        errorMessage.includes('already reviewed') ||
        errorMessage.includes('duplicate')
      ) {
        setUserHasReviewed(true);
        setShowReviewForm(false);
        Alert.alert('Info', 'You have already reviewed this product.');
      } else {
        Alert.alert(
          'Error',
          errorMessage || 'Failed to submit review. Please try again.'
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <TouchableOpacity onPress={toggleWishlist}>
            <Text style={styles.wishlistIcon}>{inWishlist ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>

        {product.averageRating && (
          <Text style={styles.productRating}>
            ⭐ {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
          </Text>
        )}

        <Text style={styles.productStock}>
          {product.stock > 0
            ? `${product.stock} units in stock`
            : 'Out of stock'}
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.productDescription}>{product.description}</Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() =>
                setQuantity(Math.min(product.stock, quantity + 1))
              }
              disabled={quantity >= product.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            product.stock === 0 && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Text style={styles.addToCartButtonText}>
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>

          {!userHasReviewed && !showReviewForm && (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Text style={styles.writeReviewButtonText}>Write a Review</Text>
            </TouchableOpacity>
          )}

          {userHasReviewed && (
            <Text style={styles.alreadyReviewedText}>
              ✓ You have already reviewed this product
            </Text>
          )}

          {showReviewForm && (
            <ReviewForm
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          <ReviewList reviews={reviews} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  wishlistIcon: {
    fontSize: 24,
    marginLeft: 10,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginBottom: 10,
  },
  productRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  quantityButton: {
    padding: 10,
    paddingHorizontal: 15,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#2D6A4F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewsSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  writeReviewButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D6A4F',
    alignItems: 'center',
    marginBottom: 20,
  },
  writeReviewButtonText: {
    color: '#2D6A4F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alreadyReviewedText: {
    fontSize: 14,
    color: '#2D6A4F',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
});
