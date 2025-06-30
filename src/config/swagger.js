const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PDF Scanner API",
      version: "1.0.0",
      description: "A RESTful API for PDF upload, scanning, and user authentication",
      contact: {
        name: "API Support",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "User ID"
            },
            username: {
              type: "string",
              description: "Username"
            },
            email: {
              type: "string",
              format: "email",
              description: "User email"
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation date"
            }
          }
        },
        PDF: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "PDF ID"
            },
            filename: {
              type: "string",
              description: "Original filename"
            },
            size: {
              type: "integer",
              description: "File size in bytes"
            },
            pages: {
              type: "integer",
              description: "Number of pages"
            },
            text: {
              type: "string",
              description: "Extracted text content"
            },
            uploadedAt: {
              type: "string",
              format: "date-time",
              description: "Upload date"
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              description: "Error message"
            }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 