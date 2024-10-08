import express from 'express';
import { createInvoice, downloadInvoice, filterByStatus, getAllInvoices, getInvoiceById, totalInvoice, updateInvoice } from '../controllers/invoices.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/createinvoice', authenticateUser, createInvoice);
Router.get('/getinvoice/:invoiceId', authenticateUser, getInvoiceById);
Router.get('/getallinvoice', authenticateUser, getAllInvoices);
Router.get('/filterbystatus', authenticateUser, filterByStatus);
Router.get('/invoicecount', authenticateUser, totalInvoice);
Router.put('/updateinvoice', authenticateUser, updateInvoice);

Router.get('/download/:invoiceId', authenticateUser, downloadInvoice);


export default Router;