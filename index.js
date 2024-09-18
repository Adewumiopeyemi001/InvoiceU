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
import accountRoutes from './src/routes/account.route.js';
import passportSetup from './src/config/passport.js';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InvoiceU API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/users.route.js'], 
};


const swaggerSpec = swaggerJsdoc(options);
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
