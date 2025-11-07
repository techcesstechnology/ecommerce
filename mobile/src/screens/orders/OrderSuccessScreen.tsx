import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>
        Your order has been successfully placed and payment confirmed.
      </Text>

      <Text style={styles.orderNumber}>Order #{orderId}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OrderHistory')}
      >
        <Text style={styles.buttonText}>View Order Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Continue Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2D6A4F',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2D6A4F',
  },
  secondaryButtonText: {
    color: '#2D6A4F',
  },
});
