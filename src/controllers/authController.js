const authService = require("../services/authService");
const { validationResult } = require("express-validator");

class AuthController {
  // Render view routes
  static async createAccount(req, res) {
    // Check for referral code in query parameters
    const referralCode = req.query.ref || "";
    return res.render("authView/sign_up", { referralCode });
  }

  static async login(req, res) {
    return res.render("authView/sign_in");
  }

  static async forgottenPassword(req, res) {
    return res.render("authView/forgotten_password");
  }

  // API Routes for authentication

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { fullName, email, password, country, referralCode } = req.body;

      // Process registration using the auth service
      const result = await authService.register({
        fullName,
        email,
        password,
        country,
        referredBy: referralCode,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Return success response
      return res.status(201).json(result);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during registration.",
      });
    }
  }

  /**
   * Verify a user's email
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      const result = await authService.verifyEmail(token);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Return success response or redirect to login page
      if (req.accepts("html")) {
        // If it's a browser request, redirect to login with a success message
        return res.redirect("/auth/login?verified=true");
      } else {
        // For API requests, return JSON
        return res.status(200).json(result);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during email verification.",
      });
    }
  }

  /**
   * Log in a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async loginUser(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Process login using the auth service
      const result = await authService.login(email, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.cookie("authorization", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        sameSite: "lax",
      });
        // For browser requests, redirect based on user role
        const userRole = result.user.role;
        let redirectURL = userRole === "admin"
        ? "/admin/dashboard"
        : userRole === "user"
        ? "/user/dashboard"
        : "#";
        result.redirectURL = redirectURL;
        return res.status(200).json(result);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login.",
      });
    }
  }

  /**
   * @description Resend verification email to user
   * @param {String} email - User's email address
   * @returns {Promise<Object>} Success message
   */
  static async resendVerificationEmail(req, res) {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required.",
        });
      }
      // Find user by email
      const user = await authService.resendVerificationEmail(email);
      // Return success response or redirect to login page
      if (req.accepts("html")) {
        // If it's a browser request, redirect to login with a success message
        return res.redirect("/auth/login?verified=true");
      } else {
        // For API requests, return JSON
        return res.status(200).json(result);
      }
    } catch (error) {
      console.log("Error resending verification email:", error);

      return res.status(500).json({
        success: false,
        message: "An error occurred during sending email verification.",
      });
    }
  }



  /**
   * Log out a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async logout(req, res) {
      res.cookie('authorization', '', {maxAge: 1});
      res.redirect('/auth/login?logout=true');
  }

  /**
   * Request a password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async forgotPassword(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      // Always return success to prevent email enumeration
      return res.status(200).json(result);
    } catch (error) {
      console.error("Forgot password error:", error);
      // Still return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link.",
      });
    }
  }

  /**
   * Reset a user's password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async resetPassword(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { token } = req.params;
      const { password } = req.body;

      const result = await authService.resetPassword(token, password);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Return success response or redirect to login page
      if (req.accepts("html")) {
        // If it's a browser request, redirect to login with a success message
        return res.redirect("/auth/login?reset=true");
      } else {
        // For API requests, return JSON
        return res.status(200).json(result);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during password reset.",
      });
    }
  }
}

module.exports = AuthController;
