import Joi from 'joi';

const locationSchema = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
});

const addressSchema = Joi.object({
  street: Joi.string().required().min(5).max(200),
  city: Joi.string().required().min(2).max(100),
  province: Joi.string().required().valid(
    'Harare',
    'Bulawayo',
    'Manicaland',
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Masvingo',
    'Matabeleland North',
    'Matabeleland South',
    'Midlands'
  ),
  postalCode: Joi.string().optional(),
  coordinates: locationSchema.required(),
});

export const deliverySchema = Joi.object({
  orderId: Joi.string().required().uuid(),
  customerName: Joi.string().required().min(2).max(100),
  customerPhone: Joi.string().required().pattern(/^(\+263|0)[0-9]{9}$/),
  pickupLocation: addressSchema.required(),
  deliveryLocation: addressSchema.required(),
  notes: Joi.string().optional().max(500),
});

export const deliveryStatusUpdateSchema = Joi.object({
  status: Joi.string().required().valid(
    'pending',
    'assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'failed',
    'cancelled'
  ),
  notes: Joi.string().optional().max(500),
});

export const trackingInitSchema = Joi.object({
  deliveryId: Joi.string().required().uuid(),
});

export const validateDelivery = (data: unknown) => {
  return deliverySchema.validate(data);
};

export const validateDeliveryStatusUpdate = (data: unknown) => {
  return deliveryStatusUpdateSchema.validate(data);
};

export const validateTrackingInit = (data: unknown) => {
  return trackingInitSchema.validate(data);
};
