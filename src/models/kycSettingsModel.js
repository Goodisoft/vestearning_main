// models/kycSettingsModel.js
const mongoose = require("mongoose");

const KycSettingsSchema = new mongoose.Schema(
  {
    enableKYCAllUsers: {
      type: Boolean,
      default: false,
      description: "Enable KYC requirement for all users",
    },
    enableKYCSingleUser: {
      type: Boolean,
      default: true,
      description: "Enable KYC requirement for specific users",
    },
    requiredDocuments: {
      idCard: {
        type: Boolean,
        default: true,
        description: "Require ID Card for KYC verification",
      },
      passport: {
        type: Boolean,
        default: true,
        description: "Require Passport for KYC verification",
      },
      utilityBill: {
        type: Boolean,
        default: true,
        description: "Require Utility Bill for KYC verification",
      },
      selfie: {
        type: Boolean,
        default: true,
        description: "Require Selfie with ID for KYC verification",
      },
    },
    kycDescription: {
      type: String,
      default:
        "Please complete your KYC verification by uploading the required documents.",
    },
    kycInstructions: {
      type: String,
      default:
        "Upload clear, high-resolution images of your documents. All information must be clearly visible.",
    },
    withdrawalLimitWithoutKYC: {
      type: Number,
      default: 0,
      description: "Withdrawal limit for users without KYC verification",
    },
    withdrawalLimitWithKYC: {
      type: Number,
      default: 0,
      description: "Withdrawal limit for users with KYC verification",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Static method to get settings (create default if doesn't exist)
KycSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();

  if (!settings) {
    settings = await this.create({});
  }

  return settings;
};

module.exports = mongoose.model("KYCSettings", KycSettingsSchema);
