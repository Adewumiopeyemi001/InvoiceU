

export const options = {
    definition: {
        openapi: "3.0.0",
        info: {
          title: "Invoice Generation API",
          version: "1.0.0",
          description: "This API provides endpoints to create, manage, and share invoices for businesses. It allows users to perform various actions such as creating new invoices, managing clients, calculating taxes, generating PDF documents, and sharing invoices across multiple platforms. The API ensures secure access through authentication and supports invoice tracking and management with detailed reporting features.",
      },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",  // Optional format for clarity
                },
            },
        },
        security: [
            {
                bearerAuth: [],  // Apply this globally
            },
        ],
    },
    apis: ["./src/routes/users.route.js", "./src/routes/clients.route.js", "./src/routes/account.route.js", "./src/routes/invoices.route.js", "./src/routes/googleAuth.js"], 
  };
  