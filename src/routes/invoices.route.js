import express from 'express';
import { createInvoice, deleteInvoice, downloadInvoice, filterByStatus, getAllInvoices, getInvoiceById, shareInvoices, totalInvoice, updateInvoice } from '../controllers/invoices.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/createinvoice', authenticateUser, createInvoice);
Router.get('/getinvoice/:invoiceId', authenticateUser, getInvoiceById);
Router.get('/getallinvoice', authenticateUser, getAllInvoices);
Router.get('/filterbystatus', authenticateUser, filterByStatus);
Router.get('/invoicecount', authenticateUser, totalInvoice);
Router.put('/updateinvoice/:invoiceId', authenticateUser, updateInvoice);
Router.delete('/delete/:invoiceId', authenticateUser, deleteInvoice);

// For downloading invoice in PDF format
Router.get('/download/:invoiceId', authenticateUser, downloadInvoice);
Router.post('/share/:invoiceIds/:email', authenticateUser, shareInvoices);


export default Router;