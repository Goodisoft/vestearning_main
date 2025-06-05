const express = require("express");
const router = express.Router();
const adminPageManagerController = require("../../controllers/adminControllers/adminPageManagerController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");

// Apply admin auth middleware to all routes
router.use(protect, restrictTo("admin"));

// Main page manager view
router.get("/page-manager", adminPageManagerController.renderPageManager);

// Hero Section routes
router.get(
  "/api/pages/hero-section",
  adminPageManagerController.getHeroSection
);
router.put(
  "/api/pages/hero-section",
  adminPageManagerController.updateHeroSection
);

// About Section routes
router.get(
  "/api/pages/about-section",
  adminPageManagerController.getAboutSection
);
router.put(
  "/api/pages/about-section",
  adminPageManagerController.updateAboutSection
);

// Why Choose Us Section routes
router.get(
  "/api/pages/why-choose-us",
  adminPageManagerController.getWhyChooseUs
);
router.post(
  "/api/pages/why-choose-us",
  adminPageManagerController.addWhyChooseUs
);
router.put(
  "/api/pages/why-choose-us/:id",
  adminPageManagerController.updateWhyChooseUs
);
router.delete(
  "/api/pages/why-choose-us/:id",
  adminPageManagerController.deleteWhyChooseUs
);

// Testimonials routes
router.get(
  "/api/pages/testimonials",
  adminPageManagerController.getTestimonials
);
router.post(
  "/api/pages/testimonials",
  adminPageManagerController.addTestimonial
);
router.put(
  "/api/pages/testimonials/:id",
  adminPageManagerController.updateTestimonial
);
router.delete(
  "/api/pages/testimonials/:id",
  adminPageManagerController.deleteTestimonial
);

// FAQs routes
router.get("/api/pages/faqs", adminPageManagerController.getFAQs);
router.post("/api/pages/faqs", adminPageManagerController.addFAQ);
router.put("/api/pages/faqs/:id", adminPageManagerController.updateFAQ);
router.delete("/api/pages/faqs/:id", adminPageManagerController.deleteFAQ);

// Crypto Tips routes
router.get("/api/pages/crypto-tips", adminPageManagerController.getCryptoTips);
router.post("/api/pages/crypto-tips", adminPageManagerController.addCryptoTip);
router.put(
  "/api/pages/crypto-tips/:id",
  adminPageManagerController.updateCryptoTip
);
router.delete(
  "/api/pages/crypto-tips/:id",
  adminPageManagerController.deleteCryptoTip
);

// Top Investors routes
router.get(
  "/api/pages/top-investors",
  adminPageManagerController.getTopInvestors
);
router.post(
  "/api/pages/top-investors",
  adminPageManagerController.addTopInvestor
);
router.put(
  "/api/pages/top-investors/:id",
  adminPageManagerController.updateTopInvestor
);
router.delete(
  "/api/pages/top-investors/:id",
  adminPageManagerController.deleteTopInvestor
);

module.exports = router;
