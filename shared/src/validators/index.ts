import { isValidEmail, isValidZimbabwePhone, isStrongPassword } from '../utils';

// User validation
export interface UserValidationErrors {
  email?: string;
  password?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export const validateUserRegistration = (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): UserValidationErrors => {
  const errors: UserValidationErrors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }

  if (!data.password || !isStrongPassword(data.password)) {
    errors.password =
      'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
  }

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }

  if (data.phone && !isValidZimbabwePhone(data.phone)) {
    errors.phone = 'Invalid Zimbabwe phone number';
  }

  return errors;
};

// Product validation
export interface ProductValidationErrors {
  name?: string;
  price?: string;
  description?: string;
  stock?: string;
}

export const validateProduct = (data: {
  name: string;
  price: number;
  description: string;
  stock: number;
}): ProductValidationErrors => {
  const errors: ProductValidationErrors = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Product name must be at least 3 characters';
  }

  if (data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (data.stock < 0) {
    errors.stock = 'Stock cannot be negative';
  }

  return errors;
};
