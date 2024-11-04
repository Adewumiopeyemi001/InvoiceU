import express from 'express';
import cors from 'cors';
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
import { options } from './src/middlewares/swaggerDoc.js';

dotenv.config();

const app = express();

// Apply CORS globally
app.use(cors());

// Handle preflight requests for all routes
app.options('*', cors());

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerSpec = swaggerJsdoc(options);

// Set up Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

// Configure session and passport
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Test route to confirm server is running
app.get('/', (req, res) => {
  res.send('Welcome to invoiceU');
});

// Mount routers for each endpoint
app.use('/', userRouter);
app.use('/', authRoutes);
app.use('/', clientRoutes);
app.use('/', invoiceRoutes);
app.use('/', accountRoutes);

// Start server and connect to the database
const server = app.listen(PORT, async () => {
  try {
    await connectDB(process.env.MONGODB_URL);
    console.log('Connected to database');
    console.log(`Listening on http://localhost:${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
