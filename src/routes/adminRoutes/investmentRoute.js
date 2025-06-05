const express = require("express");
const router = express.Router();
const InvestmentController = require("../../controllers/adminControllers/investmentController");
const { protect, restrictTo } = require("../../middlewares/authMiddleware");
const {planValidation} = require("../../middlewares/planValidationMiddleware");
const { handleQrCodeUpload } = require("../../middlewares/uploadMiddleware");

// View routes
router.get(
  "/active",
  protect,
  restrictTo("admin"),
  InvestmentController.activeInvestList
);
router.get(
  "/completed",
  protect,
  restrictTo("admin"),
  InvestmentController.completedInvestList
);
router.get(
  "/all",
  protect,
  restrictTo("admin"),
  InvestmentController.allInvestedList
);

router.get(
  "/plan-scheme",
  protect,
  restrictTo("admin"),
  InvestmentController.PlanSchemeList
);

// API routes for investment plans
router.get(
  "/api/plans",
  protect,
  restrictTo("admin"),
  InvestmentController.getAllPlans
);
router.post(
  "/api/plans",
  protect,
  restrictTo("admin"),
  planValidation,
  InvestmentController.createPlan
);
router.get(
  "/api/plans/statistics",
  protect,
  restrictTo("admin"),
  InvestmentController.getPlanStatistics
);
router.get(
  "/api/plans/:id",
  protect,
  restrictTo("admin"),
  InvestmentController.getPlanById
);
router.put(
  "/api/plans/:id",
  protect,
  restrictTo("admin"),
  planValidation,
  InvestmentController.updatePlan
);
router.patch(
  "/api/plans/:id/toggle-status",
  protect,
  restrictTo("admin"),
  InvestmentController.togglePlanStatus
);
router.delete(
  "/api/plans/:id",
  protect,
  restrictTo("admin"),
  InvestmentController.deletePlan
);

// Currency management routes
router.get("/currencies", protect, restrictTo("admin"), InvestmentController.getCurrenciesPage);
router.post("/api/currencies", protect, restrictTo("admin"), handleQrCodeUpload, InvestmentController.createCurrency);
router.get("/api/currencies/:id", protect, restrictTo("admin"), InvestmentController.getCurrency);
router.post("/api/currencies/:id", protect, restrictTo("admin"), handleQrCodeUpload, InvestmentController.updateCurrency);
router.patch("/api/currencies/:id/toggle-status", protect, restrictTo("admin"), InvestmentController.toggleCurrencyStatus);
router.delete("/api/currencies/:id", protect, restrictTo("admin"), InvestmentController.deleteCurrency);

module.exports = router;
