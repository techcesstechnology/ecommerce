import Joi from 'joi';

export const driverSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  phone: Joi.string().required().pattern(/^(\+263|0)[0-9]{9}$/), // Zimbabwe phone format
  email: Joi.string().email().required(),
  vehicleType: Joi.string().required().valid('motorcycle', 'car', 'van', 'truck'),
  vehicleNumber: Joi.string().required().pattern(/^[A-Z]{3}[0-9]{4}$/), // Zimbabwe plate format
});

export const driverUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^(\+263|0)[0-9]{9}$/),
  email: Joi.string().email(),
  vehicleType: Joi.string().valid('motorcycle', 'car', 'van', 'truck'),
  vehicleNumber: Joi.string().pattern(/^[A-Z]{3}[0-9]{4}$/),
  status: Joi.string().valid('available', 'on_delivery', 'offline', 'break'),
  isAvailable: Joi.boolean(),
});

export const locationSchema = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
});

export const driverLocationUpdateSchema = Joi.object({
  driverId: Joi.string().required().uuid(),
  location: locationSchema.required(),
});

export const driverAssignmentSchema = Joi.object({
  driverId: Joi.string().required().uuid(),
  deliveryId: Joi.string().required().uuid(),
});

export const validateDriver = (data: unknown) => {
  return driverSchema.validate(data);
};

export const validateDriverUpdate = (data: unknown) => {
  return driverUpdateSchema.validate(data);
};

export const validateLocationUpdate = (data: unknown) => {
  return driverLocationUpdateSchema.validate(data);
};

export const validateDriverAssignment = (data: unknown) => {
  return driverAssignmentSchema.validate(data);
};
