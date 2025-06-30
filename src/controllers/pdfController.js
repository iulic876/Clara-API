const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");

// In-memory storage for uploaded PDFs (replace with database in production)
const uploadedPdfs = [];

const pdfController = {
  // Upload PDF file
  uploadPdf: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No PDF file uploaded"
        });
      }

      // Check if file is PDF
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed"
        });
      }

      // Read and parse the PDF
      const pdfBuffer = req.file.buffer;
      const pdfData = await pdfParse(pdfBuffer);

      // Create PDF record
      const pdfRecord = {
        id: uploadedPdfs.length + 1,
        filename: req.file.originalname,
        size: req.file.size,
        pages: pdfData.numpages,
        text: pdfData.text,
        uploadedAt: new Date(),
        userId: req.user?.userId || null // If user is authenticated
      };

      uploadedPdfs.push(pdfRecord);

      // Return PDF info (without full text for now)
      const { text: _, ...pdfInfo } = pdfRecord;

      res.status(201).json({
        success: true,
        message: "PDF uploaded and scanned successfully",
        pdf: pdfInfo
      });

    } catch (error) {
      console.error("PDF upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error processing PDF file"
      });
    }
  },

  // Scan PDF content (extract text and metadata)
  scanPdf: async (req, res) => {
    try {
      const { pdfId } = req.params;

      // Find the PDF
      const pdf = uploadedPdfs.find(p => p.id === parseInt(pdfId));
      
      if (!pdf) {
        return res.status(404).json({
          success: false,
          message: "PDF not found"
        });
      }

      // Return full PDF data including text
      res.json({
        success: true,
        pdf: {
          id: pdf.id,
          filename: pdf.filename,
          size: pdf.size,
          pages: pdf.pages,
          text: pdf.text,
          uploadedAt: pdf.uploadedAt
        }
      });

    } catch (error) {
      console.error("PDF scan error:", error);
      res.status(500).json({
        success: false,
        message: "Error scanning PDF"
      });
    }
  },

  // Get all uploaded PDFs for a user
  getUserPdfs: (req, res) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const userPdfs = uploadedPdfs
        .filter(pdf => pdf.userId === userId)
        .map(pdf => {
          const { text: _, ...pdfInfo } = pdf;
          return pdfInfo;
        });

      res.json({
        success: true,
        pdfs: userPdfs
      });

    } catch (error) {
      console.error("Get user PDFs error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving PDFs"
      });
    }
  },

  // Delete PDF
  deletePdf: (req, res) => {
    try {
      const { pdfId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const pdfIndex = uploadedPdfs.findIndex(pdf => 
        pdf.id === parseInt(pdfId) && pdf.userId === userId
      );

      if (pdfIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "PDF not found or access denied"
        });
      }

      uploadedPdfs.splice(pdfIndex, 1);

      res.json({
        success: true,
        message: "PDF deleted successfully"
      });

    } catch (error) {
      console.error("Delete PDF error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting PDF"
      });
    }
  }
};

module.exports = pdfController; 