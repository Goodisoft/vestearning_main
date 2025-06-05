/**
 * @fileoverview Authentication service for handling authentication business logic
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authRepository = require("../repositories/authRepository");
const userRepository = require("../repositories/userRepository");
const emailService = require("../utils/emailService");
const codeGenerator = require("../utils/codeGenerator");
const tokenCrypto = require("../utils/tokenCrypto");
const walletService = require("../services/walletService");

// Token blacklist for storing invalidated tokens (in memory for now, should be in Redis for production)
const tokenBlacklist = new Set();

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Promise<{success: boolean, user: Object, message: string}>}
 */
async function register(userData) {
  try {
    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(userData.email);
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    let referredBy = null;

    // Check if the referredBy user exists
    if (userData.referredBy) {
      const referrer = await userRepository.findByReferralCode(
        userData.referredBy
      );
      if (!referrer) {
        return {
          success: false,
          message: "Invalid referral code",
        };
      }
      referredBy = referrer._id;
    }

    // Generate a unique referral code
    const referralCode = codeGenerator.generateReferralCode();
    userData.referralCode = referralCode;
    userData.referredBy = referredBy;

    // Save the user to the database
    const user = await authRepository.create(userData);

    // Initialize the user's wallet balance
    await walletService.initializeWallet(user._id);

    // Generate JWT verification token instead of storing in the database
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: "email_verification" },
      process.env.JWT_EMAIL_VERIFICATION_SECRET ||
        process.env.JWT_ACCESS_SECRET,
      { expiresIn: "24h" }
    );

    // Encrypt the verification token
    const encryptedToken = tokenCrypto.encryptToken(verificationToken);

    // Create verification URL with encrypted token
    const verificationUrl = `${
      process.env.BASE_URL
    }/auth/verify-email?token=${encodeURIComponent(encryptedToken)}`;

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationUrl);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    // Notify the admin about the new user registration
    await sendAdminNotificationEmail(user, userData.password)

    // Prepare the user object to return without sensitive data
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      country: user.country,
      referralCode: user.referralCode,
      isEmailVerified: user.isEmailVerified,
    };

    return {
      success: true,
      user: safeUser,
      message:
        "User registered successfully. Please check your email to verify your account.",
    };
  } catch (error) {
    return {
      success: false,
      message: `Registration failed: ${error.message}`,
    };
  }
}

/**
 * Verify a user's email
 * @param {string} encryptedToken - Encrypted email verification token
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function verifyEmail(encryptedToken) {
  try {
    // Decrypt the token
    const token = tokenCrypto.decryptToken(encryptedToken);

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_EMAIL_VERIFICATION_SECRET || process.env.JWT_ACCESS_SECRET
    );

    // Check if this is actually an email verification token
    if (decoded.purpose !== "email_verification") {
      return {
        success: false,
        message: "Invalid verification token",
      };
    }

    // Find the user by userId from the token
    const user = await authRepository.findById(decoded.userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    // Update the user's isEmailVerified flag directly
    await userRepository.update(decoded.userId, { isEmailVerified: true });

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        success: false,
        message:
          "Verification link has expired. Please request a new verification link.",
      };
    }
    return {
      success: false,
      message: `Email verification failed: ${error.message}`,
    };
  }
}

/**
 * Login a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{success: boolean, user?: Object, tokens?: Object, message: string}>}
 */
async function login(email, password) {
  try {
    // Find the user by email with password
    const user = await authRepository.findUserByEmailWithPassword(email);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return {
        success: false,
        message: "Your account has been blocked. Please contact support.",
      };
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate a new verification token
      const verificationToken = jwt.sign(
        { userId: user._id, email: user.email, purpose: "email_verification" },
        process.env.JWT_EMAIL_VERIFICATION_SECRET ||
          process.env.JWT_ACCESS_SECRET,
        { expiresIn: "24h" }
      );

      // Encrypt the verification token
      const encryptedToken = tokenCrypto.encryptToken(verificationToken);

      // Create verification URL with encrypted token
      const verificationUrl = `${
        process.env.BASE_URL
      }/auth/verify-email?token=${encodeURIComponent(encryptedToken)}`;

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user.email, verificationUrl);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      return {
        success: false,
        message:
          "Please verify your email before logging in. A new verification link has been sent to your email.",
      };
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }
    // Update last login timestamp
    await userRepository.update(user._id, { lastLogin: Date.now() });

    // Generate JWT tokens
    // Generate a new verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: "login_auth" },
      process.env.JWT_EMAIL_VERIFICATION_SECRET ||
        process.env.JWT_ACCESS_SECRET,
      { expiresIn: "24h" }
    );

    // Encrypt the verification token
    const encryptedToken = tokenCrypto.encryptToken(verificationToken);

    // Send the encoded token to cookies

    // Prepare the user object to return without sensitive data
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      country: user.country,
      referralCode: user.referralCode,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    return {
      success: true,
      user: safeUser,
      token: encryptedToken,
      message: "Login successful",
    };
  } catch (error) {
    return {
      success: false,
      message: `Login failed: ${error.message}`,
    };
  }
}

/**
 * Resend verification email to a user
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function resendVerificationEmail(email) {
  try {
    // Find the user by email
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      // Return success to prevent email enumeration
      return {
        success: true,
        message:
          "If your email is registered and not verified, you will receive a verification link.",
      };
    }

    // If already verified, no need to send again
    if (user.isEmailVerified) {
      return {
        success: true,
        message: "Your email is already verified. You can log in.",
      };
    }

    // Generate JWT verification token
    const verificationToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: "email_verification" },
      process.env.JWT_EMAIL_VERIFICATION_SECRET ||
        process.env.JWT_ACCESS_SECRET,
      { expiresIn: "24h" }
    );

    // Encrypt the verification token
    const encryptedToken = tokenCrypto.encryptToken(verificationToken);

    // Create verification URL with encrypted token
    const verificationUrl = `${
      process.env.BASE_URL
    }/auth/verify-email?token=${encodeURIComponent(encryptedToken)}`;

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationUrl);

    return {
      success: true,
      message:
        "If your email is registered and not verified, a verification link has been sent.",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to resend verification email: ${error.message}`,
    };
  }
}



/**
 * Request a password reset
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function forgotPassword(email) {
  try {
    // Check if user exists
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return success to prevent email enumeration
      return {
        success: true,
        message:
          "If your email is registered, you will receive a password reset link.",
      };
    }

    // Generate JWT reset token instead of using database storage
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, purpose: "password_reset" },
      process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    // Encrypt the reset token
    const encryptedToken = tokenCrypto.encryptToken(resetToken);

    // Create reset URL with encrypted token
    const resetUrl = `${
      process.env.BASE_URL
    }/auth/reset-password?token=${encodeURIComponent(encryptedToken)}`;

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      throw new Error("Failed to send password reset email");
    }

    return {
      success: true,
      message:
        "If your email is registered, you will receive a password reset link.",
    };
  } catch (error) {
    return {
      success: false,
      message: `Password reset request failed: ${error.message}`,
    };
  }
}

/**
 * Reset a user's password
 * @param {string} encryptedToken - Encrypted password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function resetPassword(encryptedToken, newPassword) {
  try {
    // Decrypt the token
    const token = tokenCrypto.decryptToken(encryptedToken);

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_PASSWORD_RESET_SECRET || process.env.JWT_ACCESS_SECRET
    );

    // Check if this is actually a password reset token
    if (decoded.purpose !== "password_reset") {
      return {
        success: false,
        message: "Invalid reset token",
      };
    }

    // Find the user by userId from the token
    const user = await authRepository.findById(decoded.userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Update the user's password
    await authRepository.updatePassword(user._id, newPassword);

    // Invalidate all refresh tokens by clearing them
    await authRepository.clearRefreshToken(user._id);

    return {
      success: true,
      message: "Password reset successful",
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        success: false,
        message: "Password reset link has expired. Please request a new link.",
      };
    }
    return {
      success: false,
      message: `Password reset failed: ${error.message}`,
    };
  }
}

/**
 * Generate an access token
 * @param {string} userId - User ID
 * @returns {string} JWT access token
 */
function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m", // Short-lived token
  });
}


/**
 * Send notification email to admin about new investment
 * @param {Object} user - The user object
 * @param {Object} plan - The investment plan
 * @param {number} amount - Investment amount
 * @param {string} currency - Currency symbol
 * @param {string} txHash - Transaction hash/ID
 */
async function sendAdminNotificationEmail(user, password) {
  // In a real app, you would fetch admin emails from the database or config
  const adminEmail = process.env.EMAIL_USER ;
  const subject = `New Registration Notification`;
  const link = `${process.env.BASE_URL}/auth/login`;
  const buttonText = "View User Details";
  const message = `
    <h2>New Registration Notification</h2>
    <p>A user just created a new account.</p>
    <h3>User Details:</h3>
    <ul>
      <li><strong>User:</strong> ${user.fullName}</li>
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>Country:</strong> ${user.country}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>Please log in to the admin dashboard for more information about the user.</p>
  `;

  try {
    await sendEmail(adminEmail, subject, message, link, buttonText);
  } catch (error) {
    console.error("Error sending admin notification email:", error);
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
};
