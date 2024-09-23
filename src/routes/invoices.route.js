import express from 'express';
import { createInvoice } from '../controllers/invoices.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/createinvoice', authenticateUser, createInvoice)


export default Router;