import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { paymentService } from '../../services/paymentService';

export default function PaymentScreen({ route, navigation }: any) {
  const { orderId, paymentMethod, phoneNumber } = route.params;
  const [status, setStatus] = useState('Processing payment...');
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initiatePayment();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const initiatePayment = async () => {
    try {
      const payment = await paymentService.initiatePayment(
        orderId,
        paymentMethod,
        phoneNumber
      );

      if (payment.status === 'completed') {
        navigation.replace('OrderSuccess', { orderId });
      } else if (payment.status === 'failed') {
        Alert.alert('Payment Failed', 'Your payment could not be processed');
        navigation.goBack();
      } else {
        startPolling(payment.reference || '');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to initiate payment'
      );
      navigation.goBack();
    }
  };

  const startPolling = (reference: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    pollIntervalRef.current = setInterval(async () => {
      attempts++;

      if (attempts >= maxAttempts) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        Alert.alert(
          'Payment Timeout',
          'Payment verification timed out. Please check your order history.'
        );
        navigation.navigate('Main');
        return;
      }

      try {
        const payment = await paymentService.checkPaymentStatus(reference);

        if (payment.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          navigation.replace('OrderSuccess', { orderId });
        } else if (payment.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          Alert.alert('Payment Failed', 'Your payment could not be processed');
          navigation.goBack();
        } else {
          setStatus(`Waiting for payment confirmation... (${attempts * 5}s)`);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    }, 5000);
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D6A4F" />
      <Text style={styles.statusText}>{status}</Text>

      {paymentMethod === 'ecocash' && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>EcoCash Payment</Text>
          <Text style={styles.instructionsText}>
            Please check your phone for an EcoCash prompt and enter your PIN to complete the payment.
          </Text>
        </View>
      )}

      <Text style={styles.waitingText}>Please wait...</Text>
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
  statusText: {
    fontSize: 18,
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  waitingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
  },
});
