const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfController = require("../controllers/pdfController");
const authMiddleware = require("../middleware/auth");

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  }
});

/**
 * @swagger
 * /api/pdf/upload:
 *   post:
 *     summary: Upload and scan PDF file
 *     tags: [PDF]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pdf
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload (max 10MB)
 *     responses:
 *       201:
 *         description: PDF uploaded and scanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "PDF uploaded and scanned successfully"
 *                 pdf:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     filename:
 *                       type: string
 *                       example: "document.pdf"
 *                     size:
 *                       type: integer
 *                       example: 1024000
 *                     pages:
 *                       type: integer
 *                       example: 5
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - no file or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/upload", upload.single("pdf"), pdfController.uploadPdf);

/**
 * @swagger
 * /api/pdf/scan/{pdfId}:
 *   get:
 *     summary: Get scanned PDF content
 *     tags: [PDF]
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the PDF to scan
 *         example: 1
 *     responses:
 *       200:
 *         description: PDF content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pdf:
 *                   $ref: '#/components/schemas/PDF'
 *       404:
 *         description: PDF not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/scan/:pdfId", pdfController.scanPdf);

/**
 * @swagger
 * /api/pdf/my-pdfs:
 *   get:
 *     summary: Get all PDFs for authenticated user
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User PDFs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pdfs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       filename:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       pages:
 *                         type: integer
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/my-pdfs", authMiddleware, pdfController.getUserPdfs);

/**
 * @swagger
 * /api/pdf/{pdfId}:
 *   delete:
 *     summary: Delete PDF file
 *     tags: [PDF]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pdfId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the PDF to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: PDF deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "PDF deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: PDF not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:pdfId", authMiddleware, pdfController.deletePdf);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB"
      });
    }
  }
  
  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router; 