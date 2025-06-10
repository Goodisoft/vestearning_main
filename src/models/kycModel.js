// models/kyc.model.js
const mongoose = require("mongoose");

const KycSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },
    documents: [
      {
        documentType: { type: String },
        documentUrl: { type: String },
        dob: { type: String },
        phoneNumber: { type: String },
      },
    ],
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming the admin who requested the KYC is a User
    },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KYC", KycSchema);
