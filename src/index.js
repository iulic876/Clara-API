const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");
require("dotenv").config();
// Import routes
const authRoutes = require("./routes/auth");
const pdfRoutes = require("./routes/pdf");

const app = express();

// Database connection (optional - only if DATABASE_URL is provided)
let db = null;
if (process.env.DATABASE_URL) {
  const { Pool } = require("pg");
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "PDF Scanner API Documentation"
}));

// Routes
app.use("/api", authRoutes);
app.use("/api/pdf", pdfRoutes);

const workspacesRouter = require("./routes/Workspaces")(db);
app.use("/api/workspaces", workspacesRouter);

// Contact routes (only if database is available)
if (db) {
  const contactsRouter = require("./routes/Contact")(db);
  app.use("/api/contact", contactsRouter);
}

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "API is running!",
    documentation: "http://localhost:3001/api-docs",
    database: db ? "Connected" : "Not configured",
    endpoints: {
      auth: {
        register: "POST /api/register",
        login: "POST /api/login", 
        profile: "GET /api/profile"
      },
      pdf: {
        upload: "POST /api/pdf/upload",
        scan: "GET /api/pdf/scan/:pdfId",
        myPdfs: "GET /api/pdf/my-pdfs",
        delete: "DELETE /api/pdf/:pdfId"
      },
      ...(db && {
        contact: {
          list: "GET /api/contact",
          create: "POST /api/contact",
          update: "PUT /api/contact/:id",
          delete: "DELETE /api/contact/:id"
        }
      })
    }
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🗄️  Database: ${db ? "Connected" : "Not configured"}`);
  console.log("📋 Available endpoints:");
  console.log("   🔐 Auth:");
  console.log("      - POST /api/register - Register a new user");
  console.log("      - POST /api/login - Login user");
  console.log("      - GET /api/profile - Get user profile (protected)");
  console.log("   📄 PDF:");
  console.log("      - POST /api/pdf/upload - Upload PDF file");
  console.log("      - GET /api/pdf/scan/:pdfId - Get scanned PDF content");
  console.log("      - GET /api/pdf/my-pdfs - Get user's PDFs (protected)");
  console.log("      - DELETE /api/pdf/:pdfId - Delete PDF (protected)");
  if (db) {
    console.log("   📞 Contact:");
    console.log("      - GET /api/contact - Get all contacts");
    console.log("      - POST /api/contact - Create contact");
    console.log("      - PUT /api/contact/:id - Update contact");
    console.log("      - DELETE /api/contact/:id - Delete contact");
  }
});
