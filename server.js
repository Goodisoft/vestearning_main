const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");
const helmet = require("helmet");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const { globalErrorHandler } = require("./src/utils/errorHandler");
const { investmentCompletionCheck } = require("./src/utils/investmentCronJob");

// Load environment variables
dotenv.config();

// Start investment cron job
investmentCompletionCheck.start();

const pageRoute = require("./src/routes/pageRoute.js");
const authRoute = require("./src/routes/authRoute.js");
const adminRoute = require("./src/routes/adminRoutes/adminRoute.js");
const transactionRoute = require("./src/routes/adminRoutes/transactionRoute.js");
const referralRoute = require("./src/routes/adminRoutes/referralRoute.js");
const investmentRoute = require("./src/routes/adminRoutes/investmentRoute.js");
const kycRoute = require("./src/routes/adminRoutes/kycRoute.js");
const appSettingsRoutes = require("./src/routes/adminRoutes/appSettingsRoutes.js");
const userRoute = require("./src/routes/userRoutes/userRoute.js");
const currencyRoute = require("./src/routes/userRoutes/currencyRoute.js");
const planRoute = require("./src/routes/userRoutes/planRoute.js");
const adminPageManagerRoute = require("./src/routes/adminRoutes/adminPageManagerRoute.js");
const AppSettings = require('./src/models/appSettingsModel.js'); // adjust path as needed

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // Max 1000 requests per IP in 5 minutes
  message: "Too many requests from this IP, please try again after 5 minutes",
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10000000kb" })); // Preventing DOS Attacks
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(helmet()); // Security headers
app.use(cookieParser());

app.use(limiter); // Apply rate limiting to API routes

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.ckeditor.com",
        "https://code.jivosite.com",
        "https://translate.google.com",
        "https://translate.googleapis.com",
        "https://translate-pa.googleapis.com"
      ],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.ckeditor.com",
        "https://code.jivosite.com",
        "https://translate.google.com",
        "https://translate.googleapis.com",
        "https://translate-pa.googleapis.com"
      ],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://code.jivosite.com",
        "https://translate.googleapis.com",
        "https://node-ya-10.jivosite.com",
        "https://node-ya-3.jivosite.com",
        "https://translate-pa.googleapis.com"
      ],
      fontSrc: ["'self'", "https:", "data:"],
      frameSrc: ["'self'", "https://translate.google.com"]
    },
  })
);



app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));


// app.use((req, res, next) => {
//   console.log(`Incoming request: ${req.method} ${req.url}`);
//   next(); // Pass control to the next handler
// });


app.use(async (req, res, next) => {
  try {
    const settings = await AppSettings.findOne();                
    res.locals.appSettings = settings;
    next();
  } catch (err) {
    console.error('Failed to load app settings:', err);
    res.locals.appSettings = {}; // fallback
    next();
  }
});

// Mount API routes
app.use(pageRoute);
app.use("/auth", authRoute);

// =============User Routes============
app.use("/user", userRoute);

// =============API Routes============
app.use("/api/currencies", currencyRoute);
app.use("/api/plans", planRoute);

// =============Admin Routes============
app.use("/admin", adminRoute);
app.use("/admin/transaction", transactionRoute);
app.use("/admin/referral", referralRoute);
app.use("/admin/investment", investmentRoute);
app.use("/admin/kyc", kycRoute);
app.use("/admin/settings", appSettingsRoutes);
app.use("/admin/pages", adminPageManagerRoute);


// 404 Handler
app.all("*", (req, res, next) => {
  // For API requests, send JSON response
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
