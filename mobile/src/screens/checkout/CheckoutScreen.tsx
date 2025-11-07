import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { cartService, Cart } from '../../services/cartService';
import { orderService } from '../../services/orderService';

export default function CheckoutScreen({ navigation }: any) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Zimbabwe',
    paymentMethod: 'ecocash' as 'ecocash' | 'card' | 'cash',
    ecocashPhone: '',
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart:', error);
      Alert.alert('Error', 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCheckout = async () => {
    if (
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    if (
      formData.paymentMethod === 'ecocash' &&
      !formData.ecocashPhone
    ) {
      Alert.alert('Error', 'Please enter your EcoCash phone number');
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        ecocashPhone: formData.ecocashPhone || undefined,
      });

      navigation.navigate('Payment', {
        orderId: order.id,
        paymentMethod: formData.paymentMethod,
        phoneNumber: formData.ecocashPhone,
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Street Address *"
          value={formData.street}
          onChangeText={(value) => updateField('street', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="City *"
          value={formData.city}
          onChangeText={(value) => updateField('city', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="State/Province *"
          value={formData.state}
          onChangeText={(value) => updateField('state', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="ZIP/Postal Code *"
          value={formData.zipCode}
          onChangeText={(value) => updateField('zipCode', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Country"
          value={formData.country}
          onChangeText={(value) => updateField('country', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === 'ecocash' && styles.paymentOptionSelected,
          ]}
          onPress={() => updateField('paymentMethod', 'ecocash')}
        >
          <Text style={styles.paymentOptionText}>EcoCash Mobile Money</Text>
        </TouchableOpacity>

        {formData.paymentMethod === 'ecocash' && (
          <TextInput
            style={styles.input}
            placeholder="EcoCash Phone Number *"
            value={formData.ecocashPhone}
            onChangeText={(value) => updateField('ecocashPhone', value)}
            keyboardType="phone-pad"
          />
        )}

        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === 'card' && styles.paymentOptionSelected,
          ]}
          onPress={() => updateField('paymentMethod', 'card')}
        >
          <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === 'cash' && styles.paymentOptionSelected,
          ]}
          onPress={() => updateField('paymentMethod', 'cash')}
        >
          <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${cart.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>${cart.tax.toFixed(2)}</Text>
        </View>
        {cart.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>
              -${cart.discount.toFixed(2)}
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${cart.total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleCheckout}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.checkoutButtonText}>Place Order</Text>
        )}
      </TouchableOpacity>
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  paymentOptionSelected: {
    borderColor: '#2D6A4F',
    backgroundColor: '#E8F5E9',
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  discountValue: {
    color: '#2D6A4F',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  checkoutButton: {
    backgroundColor: '#2D6A4F',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
