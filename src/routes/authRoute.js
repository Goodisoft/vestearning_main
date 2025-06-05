const express = require("express");
const AuthController = require("../controllers/authController.js");
const { protect } = require("../middlewares/authMiddleware");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// View routes - rendering pages
router.get("/register", AuthController.createAccount);
router.get("/login", AuthController.login);
router.get("/forgotten-password", AuthController.forgottenPassword);

// API routes - JSON responses
router.post("/register", registerValidation, AuthController.register);
router.post("/login", loginValidation, AuthController.loginUser);
router.get("/verify-email", AuthController.verifyEmail);
router.get("/resend-link", AuthController.resendVerificationEmail);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  AuthController.forgotPassword
);
router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  AuthController.resetPassword
);
router.get("/logout", protect, AuthController.logout);

module.exports = router;
