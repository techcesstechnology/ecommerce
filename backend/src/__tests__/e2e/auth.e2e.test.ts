/**
 * E2E Tests for Authentication Flow
 * Tests user authentication flows using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test.describe('User Registration Flow', () => {
    test('should register a new user successfully', async ({ page }) => {
      await page.goto(`${baseURL}/register`);

      // Fill registration form
      const timestamp = Date.now();
      await page.fill('input[name="email"]', `test-${timestamp}@example.com`);
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard or show success message
      await expect(page).toHaveURL(/\/dashboard|\/profile/, { timeout: 5000 });
    });

    test('should show validation error for weak password', async ({ page }) => {
      await page.goto(`${baseURL}/register`);

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="password"]', 'weak');

      await page.click('button[type="submit"]');

      // Should show error message
      const errorMessage = page.locator('.error-message, .alert-error, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('User Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto(`${baseURL}/login`);

      // Fill login form
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard|\//, { timeout: 5000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${baseURL}/login`);

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      // Should show error message
      const errorMessage = page.locator('.error-message, .alert-error, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('User Logout Flow', () => {
    test('should logout user successfully', async ({ page }) => {
      // First login
      await page.goto(`${baseURL}/login`);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'TestPassword123!');
      await page.click('button[type="submit"]');

      // Wait for dashboard
      await page.waitForURL(/\/dashboard|\//, { timeout: 5000 });

      // Logout
      await page.click('button[aria-label="logout"], a[href*="logout"], .logout-button');

      // Should redirect to login or home
      await expect(page).toHaveURL(/\/login|\//, { timeout: 5000 });
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should request password reset', async ({ page }) => {
      await page.goto(`${baseURL}/forgot-password`);

      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Should show success message
      const successMessage = page.locator('.success-message, .alert-success, [role="status"]');
      await expect(successMessage).toBeVisible({ timeout: 3000 });
    });
  });
});
