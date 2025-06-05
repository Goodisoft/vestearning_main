/**
 * @fileoverview Plan routes for user-facing API endpoints
 */

const express = require("express");
const { protect, restrictTo} = require("../../middlewares/authMiddleware");
const planService = require("../../services/planService");

const router = express.Router();

router.use(protect, restrictTo("user"));

/**
 * @route GET /api/plans/active
 * @desc Get all active investment plans
 * @access Private
 */
router.get("/active", protect, async (req, res) => {
  try {
    // Get all active plans
    const result = await planService.getAllPlans({ active: true });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      plans: result.plans || [],
    });
  } catch (error) {
    console.error("Error fetching active plans:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching plans.",
    });
  }
});

/**
 * @route GET /api/plans/:id
 * @desc Get specific plan by ID
 * @access Private
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await planService.getPlanById(id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Check if plan is active
    if (!result.plan.isActive) {
      return res.status(400).json({
        success: false,
        message: "This investment plan is not available",
      });
    }

    return res.status(200).json({
      success: true,
      plan: result.plan,
    });
  } catch (error) {
    console.error("Error fetching plan details:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching plan details.",
    });
  }
});

module.exports = router;
