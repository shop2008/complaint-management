import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Customer Complaint System API",
      version: version || "1.0.0",
      description: "API documentation for the Customer Complaint System",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        ComplaintStatus: {
          type: "string",
          enum: ["Pending", "In Progress", "Resolved", "Closed"],
          description: "Current status of the complaint",
        },
        ComplaintPriority: {
          type: "string",
          enum: ["Low", "Medium", "High"],
          description: "Priority level of the complaint",
        },
        Complaint: {
          type: "object",
          properties: {
            complaint_id: {
              type: "integer",
              description: "Unique identifier for the complaint",
            },
            user_id: {
              type: "string",
              description: "ID of the user who created the complaint",
            },
            category: {
              type: "string",
              description: "Category of the complaint",
            },
            description: {
              type: "string",
              description: "Detailed description of the complaint",
            },
            status: {
              $ref: "#/components/schemas/ComplaintStatus",
            },
            priority: {
              $ref: "#/components/schemas/ComplaintPriority",
            },
            assigned_staff: {
              type: "string",
              description: "ID of the staff member assigned to the complaint",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the complaint was created",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the complaint was last updated",
            },
            attachments: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Attachment",
              },
              description: "List of attachments associated with the complaint",
            },
          },
          required: [
            "complaint_id",
            "user_id",
            "category",
            "description",
            "status",
            "priority",
            "created_at",
            "updated_at",
          ],
        },
        Attachment: {
          type: "object",
          properties: {
            attachment_id: {
              type: "integer",
              description: "Unique identifier for the attachment",
            },
            complaint_id: {
              type: "integer",
              description: "ID of the complaint this attachment belongs to",
            },
            file_name: {
              type: "string",
              description: "Name of the uploaded file",
            },
            file_url: {
              type: "string",
              description: "URL where the file is stored",
            },
            file_type: {
              type: "string",
              description: "MIME type of the file",
            },
            file_size: {
              type: "integer",
              description: "Size of the file in bytes",
            },
            uploaded_at: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the file was uploaded",
            },
          },
          required: [
            "attachment_id",
            "complaint_id",
            "file_name",
            "file_url",
            "file_type",
            "file_size",
            "uploaded_at",
          ],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/types/*.ts"], // Path to the API routes and types
};

export const swaggerSpec = swaggerJsdoc(options);
