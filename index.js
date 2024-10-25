import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './src/config/db.js';
import userRouter from './src/routes/users.route.js';
import authRoutes from './src/routes/googleAuth.js';
import clientRoutes from './src/routes/clients.route.js';
import invoiceRoutes from './src/routes/invoices.route.js';
import accountRoutes from './src/routes/account.route.js';
import passportSetup from './src/config/passport.js';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
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

const swaggerSpec = swaggerJsdoc(options);

// Set up Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

app.use(
  session({ secret: 'your_secret_key', resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
app.get('/', (req, res) => {
  res.send('Welcome to invoiceU');
});

app.use('/', userRouter);
app.use('/', authRoutes);
app.use('/', clientRoutes);
app.use('/', invoiceRoutes);
app.use('/', accountRoutes);

const server = app.listen(PORT, async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log('Connected to database');
    console.log(`listening on http://localhost:${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
