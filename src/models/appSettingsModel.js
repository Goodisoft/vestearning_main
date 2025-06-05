/**
 * @description App Settings Model for storing global application settings
 */

const mongoose = require("mongoose");

/**
 * Schema for storing global application settings
 */
const appSettingsSchema = new mongoose.Schema(
  {
    // Site information
    siteName: {
      type: String,
      default: "EXNESTRADE",
    },
    siteDescription: {
      type: String,
      default: "Cryptocurrency Trading Platform",
    },
    siteLogo: {
      type: String,
      default: "/images/logo_icon/logo.png",
    },
    siteFavicon: {
      type: String,
      default: "/images/logo_icon/favicon.png",
    },
    primaryColor: {
      type: String,
      default: "#6576ff",
    },
    secondaryColor: {
      type: String,
      default: "#2c3782",
    },

    // Contact information
    contactEmail: {
      type: String,
      default: "support@exnestrade.com",
    },
    contactPhone: {
      type: String,
      default: "+1 234 5678 900",
    },
    contactAddress: {
      type: String,
      default: "1234 Street Name, City, Country",
    },

    // Social media links
    socialLinks: {
      facebook: {
        type: String,
        default: "https://facebook.com",
      },
      twitter: {
        type: String,
        default: "https://twitter.com",
      },
      instagram: {
        type: String,
        default: "https://instagram.com",
      },
      linkedin: {
        type: String,
        default: "https://linkedin.com",
      },
    },

    // Referral system settings
    referralSystem: {
      enabled: {
        type: Boolean,
        default: true,
      },
      // Multi-level referral system (up to 3 levels)
      levels: [
        {
          level: {
            type: Number,
            required: true,
          },
          commissionRate: {
            type: Number, // Percentage
            required: true,
          },
          commissionType: {
            type: String,
            enum: ["percentage"],
            default: "percentage",
          },
        },
      ],
    },

    // Maintenance mode
    maintenanceMode: {
      enabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default:
          "We are currently performing maintenance. Please check back later.",
      },
    },

    // System settings
    system: {
      registrationEnabled: {
        type: Boolean,
        default: true,
      },
      loginEnabled: {
        type: Boolean,
        default: true,
      },
      emailVerificationRequired: {
        type: Boolean,
        default: true,
      },
      kycRequired: {
        type: Boolean,
        default: true,
      },
    },

    // Updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure there's only one settings document
appSettingsSchema.statics.getSettings = async function () {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }

  // Create default settings if none exist
  return this.create({
    referralSystem: {
      enabled: true,
      levels: [
        { level: 1, commissionRate: 8, commissionType: "percentage" },
        { level: 2, commissionRate: 3, commissionType: "percentage" },
        { level: 3, commissionRate: 1, commissionType: "percentage" },
      ],
    },
  });
};

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);

module.exports = AppSettings;
