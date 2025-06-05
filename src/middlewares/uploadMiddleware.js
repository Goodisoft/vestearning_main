/**
 * @fileoverview Middleware for handling file uploads
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError } = require("../utils/errorHandler");

// Ensure the upload directory exists
const createUploadDir = (dir) => {
  const uploadPath = path.join(__dirname, "../../public/uploads", dir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// Configure storage for QR code images
const qrCodeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = createUploadDir("qrcodes");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "qr-" + uniqueSuffix + ext);
  },
});

// Configure storage for site images (logo, favicon, etc.)
const siteImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = createUploadDir("site");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp and original extension
    const filePrefix =
      file.fieldname === "logo"
        ? "logo"
        : file.fieldname === "favicon"
        ? "favicon"
        : "site";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${filePrefix}-${uniqueSuffix}${ext}`);
  },
});

// Configure storage for KYC documents
const kycDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create user-specific directory for better organization
    const userId = req.user._id.toString();
    const uploadPath = createUploadDir(`kyc/${userId}`);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with document type, timestamp and original extension
    const documentType = file.fieldname || "document";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${documentType}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  // Accept only image files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/i)) {
    return cb(new AppError("Only image files are allowed!", 400), false);
  }
  cb(null, true);
};

// File filter for KYC documents
const documentFilter = (req, file, cb) => {
  // Accept image files and PDFs for KYC
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
    return cb(
      new AppError(
        "Only JPG, PNG, and PDF files are allowed for KYC documents!",
        400
      ),
      false
    );
  }
  cb(null, true);
};

// Create the multer upload instance for QR codes
const uploadQrCode = multer({
  storage: qrCodeStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size
  },
  fileFilter: imageFilter,
});

// Create the multer upload instance for site images
const uploadSiteImage = multer({
  storage: siteImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size for site images
  },
  fileFilter: imageFilter,
});

// Create the multer upload instance for KYC documents
const uploadKycDocument = multer({
  storage: kycDocumentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size for KYC documents
  },
  fileFilter: documentFilter,
});

// Middleware for handling QR code uploads
const handleQrCodeUpload = (req, res, next) => {
  // Use multer's single() to handle a single file with field name 'qrCode'
  const upload = uploadQrCode.single("qrCode");

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A multer error occurred when uploading
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("File is too large. Maximum size is 2MB", 400)
          );
        }
        return next(new AppError(`Upload error: ${err.message}`, 400));
      }

      // An unknown error occurred
      return next(err);
    }

    // If file was uploaded, add the path to the request body
    if (req.file) {
      // Store relative path from public folder
      req.body.qrCode = `/uploads/qrcodes/${path.basename(req.file.path)}`;
    }

    next();
  });
};

// Middleware for handling logo uploads
const handleLogoUpload = (req, res, next) => {
  const upload = uploadSiteImage.single("logo");

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A multer error occurred when uploading
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("Logo is too large. Maximum size is 5MB", 400)
          );
        }
        return next(new AppError(`Logo upload error: ${err.message}`, 400));
      }

      // An unknown error occurred
      return next(err);
    }

    // If file was uploaded, add the path to the request body
    if (req.file) {
      // Store relative path from public folder
      req.body.logo = `/uploads/site/${path.basename(req.file.path)}`;
    }

    next();
  });
};

// Middleware for handling favicon uploads
const handleFaviconUpload = (req, res, next) => {
  const upload = uploadSiteImage.single("favicon");

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A multer error occurred when uploading
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("Favicon is too large. Maximum size is 5MB", 400)
          );
        }
        return next(new AppError(`Favicon upload error: ${err.message}`, 400));
      }

      // An unknown error occurred
      return next(err);
    }

    // If file was uploaded, add the path to the request body
    if (req.file) {
      // Store relative path from public folder
      req.body.favicon = `/uploads/site/${path.basename(req.file.path)}`;
    }

    next();
  });
};

// Middleware for handling multiple site images
const handleSiteImageUpload = (fieldName) => {
  return (req, res, next) => {
    const upload = uploadSiteImage.single(fieldName);

    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // A multer error occurred when uploading
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(
              new AppError("Image is too large. Maximum size is 5MB", 400)
            );
          }
          return next(new AppError(`Image upload error: ${err.message}`, 400));
        }

        // An unknown error occurred
        return next(err);
      }

      // If file was uploaded, add the path to the request body
      if (req.file) {
        // Store relative path from public folder
        req.body[fieldName] = `/uploads/site/${path.basename(req.file.path)}`;
      }

      next();
    });
  };
};

// Middleware for handling KYC document uploads
const handleKycDocumentUpload = (req, res, next) => {
  // Define the required document fields based on what's allowed in KYC settings
  const upload = uploadKycDocument.fields([
    { name: "idCard", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // A multer error occurred when uploading
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(
            new AppError("Document is too large. Maximum size is 5MB", 400)
          );
        }
        return next(
          new AppError(`KYC document upload error: ${err.message}`, 400)
        );
      }

      // An unknown error occurred
      return next(err);
    }

    // Process uploaded files and add their paths to the request body
    if (req.files) {
      req.body.documents = {};
      const userId = req.user._id.toString();

      // Process each file type
      Object.keys(req.files).forEach((fileType) => {
        if (req.files[fileType] && req.files[fileType].length > 0) {
          const file = req.files[fileType][0];
          const relativePath = `/uploads/kyc/${userId}/${path.basename(
            file.path
          )}`;
          req.body.documents[fileType] = relativePath;
        }
      });
    }

    next();
  });
};

module.exports = {
  handleQrCodeUpload,
  handleLogoUpload,
  handleFaviconUpload,
  handleSiteImageUpload,
  handleKycDocumentUpload,
  single: (fieldName) => handleSiteImageUpload(fieldName),
};
