/**
 * Cron job for checking investment completion status
 */
const cron = require("node-cron");
const Investment = require("../models/investmentModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const walletRepository = require("../repositories/walletRepository");

const { sendEmail } = require("./emailService");

// Schedule the job to run every hour
const investmentCompletionCheck = cron.schedule("*/30  * * * *", async () => {
  try {
    console.log("Running investment completion check...");
    const now = new Date();

    // Find all active investments that have reached their end date
    const completedInvestments = await Investment.find({
      status: "active",
      endDate: { $lte: now },
    })
      .populate("userId")
      .populate("planId");


    // Process each completed investment
    for (const investment of completedInvestments) {
      try {
        // Calculate final earnings
        const totalEarning = investment.amount * investment.earningRate * investment.duration;
        
        // Update investment status
        investment.status = "completed";
        investment.expectedEarning = investment.expectedEarning ?? totalEarning;
        investment.completedAt = now;
        await investment.save();

        // Find the associated transaction and update it
        const transaction = await Transaction.findOne({
          userId: investment.userId._id,
          planId: investment.planId._id,
          type: investment.type,
          status: "processing",
        });
        

        if (transaction) {
          transaction.status = "completed";
          transaction.completedAt = now;
          transaction.expectedEarning = transaction.expectedEarning != undefined ? transaction.expectedEarning : totalEarning;
          await transaction.save();
        }

        // Add earned amount to user's wallet balance
        const totalAmount = investment.expectedEarning != undefined ? investment.expectedEarning + investment.amount : investment.amount + totalEarning;
        try {
          const walletData = await walletRepository.updateWalletBalance(
            investment.userId._id,
            totalAmount
          );
          // console.log("Wallet updated successfully:", walletData);
          
        } catch (error) {
          console.error("Error updating wallet balance:", error);
        }
               

        // Send email notification to user
        await sendInvestmentCompletionEmail(
          investment.userId,
          investment.planId,
          investment.amount,
          totalEarning,
          totalAmount
        );

        console.log(`Processed completed investment ID: ${investment._id}`);
      } catch (error) {
        console.error(`Error processing investment ${investment._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in investment completion check cron job:", error);
  }
});

/**
 * Send email notification about completed investment
 * @param {Object} user - User object
 * @param {Object} plan - Plan object
 * @param {Number} investmentAmount - Original investment amount
 * @param {Number} earnings - Earned amount
 * @param {Number} totalAmount - Total amount (investment + earnings)
 */
async function sendInvestmentCompletionEmail(
  user,
  plan,
  investmentAmount,
  earnings,
  totalAmount
) {
  const subject = `Investment Completed - ${
    process.env.SITE_NAME || "EXNESTRADE"
  }`;
  const link = `${process.env.BASE_URL}/user`;
  const buttonText = "View Dashboard";

  const message = `
    <h2>Investment Completed</h2>
    <p>Dear ${user.fullName},</p>
    <p>Congratulations! Your investment has completed successfully.</p>
    <h3>Investment Details:</h3>
    <ul>
      <li><strong>Plan:</strong> ${plan.name}</li>
      <li><strong>Invested Amount:</strong> $${investmentAmount.toFixed(2)}</li>
      <li><strong>Earnings:</strong> $${earnings.toFixed(2)}</li>
      <li><strong>Total Returns:</strong> $${totalAmount.toFixed(2)}</li>
    </ul>
    <p>The total amount has been credited to your account balance.</p>
    <p>Thank you for investing with us. We look forward to your continued investment journey!</p>
  `;

  try {
    await sendEmail(user.email, subject, message, link, buttonText);
  } catch (error) {
    console.error("Error sending investment completion email:", error);
  }
}

module.exports = {
  investmentCompletionCheck,
};
