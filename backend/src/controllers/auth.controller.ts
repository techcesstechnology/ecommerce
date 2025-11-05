import { Response } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import QRCode from 'qrcode';

/**
 * Register a new user
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, name, password, phone, role } = req.body;

    const user = await authService.register({
      email,
      name,
      password,
      phone,
      role,
    });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          error: 'Conflict',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('Password must')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user',
    });
  }
};

/**
 * Login user
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, twoFactorCode } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const { user, tokens } = await authService.login({ email, password, twoFactorCode }, ipAddress);

    // Don't send sensitive fields in response
    const {
      password: _,
      twoFactorSecret: __,
      refreshTokenHash: ___,
      emailVerificationToken: ____,
      passwordResetToken: _____,
      ...userWithoutSensitive
    } = user;

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutSensitive,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('Invalid email or password') ||
        error.message.includes('Account is locked') ||
        error.message.includes('Account is deactivated') ||
        error.message.includes('Two-factor')
      ) {
        res.status(401).json({
          error: 'Unauthorized',
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login',
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No refresh token provided',
      });
      return;
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    // Set new refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token',
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh token',
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    await authService.logout(req.user.userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout',
    });
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await authService.verifyEmail(token);

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Email verified successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to verify email',
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const message = await authService.requestPasswordReset(email);

    res.status(200).json({ message });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset password
 */
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    await authService.resetPassword(token, password);

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }

      if (error.message.includes('Password must')) {
        res.status(400).json({
          error: 'Bad Request',
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to reset password',
    });
  }
};

/**
 * Setup two-factor authentication
 */
export const setupTwoFactor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const { secret, qrCode } = await authService.setupTwoFactor(req.user.userId);

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCode);

    res.status(200).json({
      message: 'Two-factor authentication setup initiated',
      secret,
      qrCode: qrCodeImage,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to setup two-factor authentication',
    });
  }
};

/**
 * Enable two-factor authentication
 */
export const enableTwoFactor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const { token } = req.body;

    await authService.enableTwoFactor(req.user.userId, token);

    res.status(200).json({
      message: 'Two-factor authentication enabled successfully',
    });
  } catch (error) {
    console.error('2FA enable error:', error);

    if (error instanceof Error && error.message.includes('Invalid')) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to enable two-factor authentication',
    });
  }
};

/**
 * Disable two-factor authentication
 */
export const disableTwoFactor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const { password } = req.body;

    await authService.disableTwoFactor(req.user.userId, password);

    res.status(200).json({
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);

    if (error instanceof Error && error.message.includes('Invalid password')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to disable two-factor authentication',
    });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile',
    });
  }
};
