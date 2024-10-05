import express from 'express';
import { createInvoice, filterByStatus, getAllInvoices, getInvoiceById, totalInvoice } from '../controllers/invoices.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/createinvoice', authenticateUser, createInvoice);
Router.get('/getinvoice/:invoiceId', authenticateUser, getInvoiceById);
Router.get('/getallinvoice', authenticateUser, getAllInvoices);
Router.get('/filterbystatus', authenticateUser, filterByStatus);
Router.get('/invoicecount', authenticateUser, totalInvoice);


export default Router;