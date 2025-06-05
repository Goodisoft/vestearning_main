const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} User
 * @property {string} fullName - User's full name
 * @property {string} email - User's email address
 * @property {string} password - User's hashed password
 * @property {string} country - User's country
 * @property {string} role - User's role (admin or user)
 * @property {boolean} isBlocked - Whether user is blocked
 * @property {boolean} isEmailVerified - Whether email is verified
 * @property {string} referralCode - User's unique referral code
 * @property {Schema.Types.ObjectId} referredBy - ID of user who referred this user
 * @property {string} kycStatus - Status of KYC verification
 * @property {Array} kycDocuments - User's KYC documents
 * @property {number} withdrawalLimit - User's withdrawal limit in smallest unit
 * @property {string} withdrawalAddress - User's withdrawal address
 * @property {Date} createdAt - When the user was created
 * @property {Date} updatedAt - When the user was last updated
 * @property {Date} lastLogin - When the user last logged in
 */

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    country: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    referralCode: { type: String, unique: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User" },
    kycStatus: {
      type: String,
      enum: ["not_required", "pending", "approved", "rejected"],
      default: "not_required",
    },
    withdrawalLimit: { type: Number, default: 0 },
    referralNeeded: { type: Number, default: 0 },
    inviteToInvest:  {
      type: String,
      enum: ["not_invited", "invited",],
      default: "not_invited",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ isBlocked: 1 });
userSchema.index({ kycStatus: 1 });

// Hash password before a new user is saved to the db
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12); // 12 salt rounds as specified in requirements
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model("User", userSchema);
