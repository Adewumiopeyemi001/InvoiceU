import express from 'express';
import { createInvoice, deleteInvoice, downloadInvoice, filterByStatus, generateInvoiceNumber, getAllInvoices, getInvoiceById, shareInvoices, totalInvoice, totalInvoiceById, updateInvoice } from '../controllers/invoices.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.get('/invoicenumber', generateInvoiceNumber);
/**
 * @swagger
 * /createinvoice:
 *   post:
 *     summary: Create a new invoice for an authenticated user
 *     description: Allows an authenticated user to create an invoice with items, client, company, and optional account details. The invoice can be saved as a draft or marked complete.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: ID of the client
 *                 example: "609bda5619a03b13f0fa1c4d"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: "Web Design Services"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *                     rate:
 *                       type: number
 *                       example: 50
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-10-20"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-11-20"
 *               phoneNumber:
 *                 type: string
 *                 example: "+123456789"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "client@example.com"
 *               accountDetailsId:
 *                 type: string
 *                 description: ID of the account to include in the invoice
 *                 example: "609cfa6545a03a22f5fa1b3f"
 *               status:
 *                 type: string
 *                 enum: ["Draft", "Completed"]
 *                 default: "Draft"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invoice completed successfully"
 *                 invoice:
 *                   type: object
 *                   properties:
 *                     invoiceNumber:
 *                       type: string
 *                       example: "#INV_123456"
 *                     issueDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-10-20"
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-11-20"
 *                     subTotal:
 *                       type: number
 *                       example: 100
 *                     tax:
 *                       type: number
 *                       example: 10
 *                     total:
 *                       type: number
 *                       example: 110
 *                     reference:
 *                       type: string
 *                       example: "#AB1234567890"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+123456789"
 *                     status:
 *                       type: string
 *                       example: "Completed"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           description:
 *                             type: string
 *                             example: "Web Design Services"
 *                           quantity:
 *                             type: number
 *                             example: 2
 *                           rate:
 *                             type: number
 *                             example: 50
 *       400:
 *         description: Bad Request - Missing required fields or invalid data
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Not Found - Required user, client, or company details not found
 *       500:
 *         description: Internal server error
 */
Router.post('/createinvoice', authenticateUser, createInvoice);

/**
 * @swagger
 * /getinvoice/{invoiceId}:
 *   get:
 *     summary: Retrieve an invoice by its ID
 *     description: Fetches a specific invoice by ID for the authenticated user.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to retrieve
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoice:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "609cfcf9a2a6b13f5d0fe1c3"
 *                     user:
 *                       type: string
 *                       example: "609bda5619a03b13f0fa1c4d"
 *                     company:
 *                       type: string
 *                       example: "609bda5619a03b13f0fa1c4d"
 *                     client:
 *                       type: string
 *                       example: "609bda5619a03b13f0fa1c4d"
 *                     invoiceNumber:
 *                       type: string
 *                       example: "#INV_123456"
 *                     issueDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-10-20"
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-11-20"
 *                     subTotal:
 *                       type: number
 *                       example: 100
 *                     tax:
 *                       type: number
 *                       example: 10
 *                     total:
 *                       type: number
 *                       example: 110
 *                     reference:
 *                       type: string
 *                       example: "#AB1234567890"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+123456789"
 *                     email:
 *                       type: string
 *                       example: "client@example.com"
 *                     status:
 *                       type: string
 *                       example: "Completed"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           description:
 *                             type: string
 *                             example: "Web Design Services"
 *                           quantity:
 *                             type: number
 *                             example: 2
 *                           rate:
 *                             type: number
 *                             example: 50
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Not Found - Invoice not found for this user
 *       500:
 *         description: Internal server error
 */
Router.get('/getinvoice/:invoiceId', authenticateUser, getInvoiceById);

/**
 * @swagger
 * /getallinvoice:
 *   get:
 *     summary: Retrieve all invoices for the authenticated user
 *     description: Fetches a paginated, sorted list of all invoices for the authenticated user, including client business names.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of invoices per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: issueDate
 *         description: Field to sort the invoices by (e.g., issueDate)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Order of sorting (asc for ascending, desc for descending)
 *     responses:
 *       200:
 *         description: Successfully retrieved invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoiceDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reference:
 *                         type: string
 *                         example: "#AB1234567890"
 *                       invoiceNumber:
 *                         type: string
 *                         example: "#INV_123456"
 *                       issueDate:
 *                         type: string
 *                         format: date
 *                         example: "2023-10-20"
 *                       totalAmount:
 *                         type: number
 *                         example: 110.00
 *                       status:
 *                         type: string
 *                         example: "Completed"
 *                       clientBusinessName:
 *                         type: string
 *                         example: "Acme Corp"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
Router.get('/getallinvoice', authenticateUser, getAllInvoices);

/**
 * @swagger
 * /filterbystatus:
 *   get:
 *     summary: Filter invoices by status for the authenticated user
 *     description: Retrieves a list of invoices filtered by the specified status, including the client's business name.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: The status to filter invoices by (e.g., Draft, Completed)
 *     responses:
 *       200:
 *         description: Successfully retrieved invoices filtered by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoiceDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       reference:
 *                         type: string
 *                         example: "#AB1234567890"
 *                       invoiceNumber:
 *                         type: string
 *                         example: "#INV_123456"
 *                       issueDate:
 *                         type: string
 *                         format: date
 *                         example: "2023-10-20"
 *                       totalAmount:
 *                         type: number
 *                         example: 110.00
 *                       status:
 *                         type: string
 *                         example: "Completed"
 *                       clientBusinessName:
 *                         type: string
 *                         example: "Acme Corp"
 *                 message:
 *                   type: string
 *                   example: "No invoices found for the given status"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
Router.get('/filterbystatus', authenticateUser, filterByStatus);

/**
 * @swagger
 * /invoicecount:
 *   get:
 *     summary: Get the count of completed invoices for the authenticated user
 *     description: Returns the total number of invoices with the status "Completed" associated with the authenticated user.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved count of completed invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalCompletedInvoices:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
Router.get('/invoicecount', authenticateUser, totalInvoice);

/**
 * @swagger
 * /invoice-count/{clientId}:
 *   get:
 *     summary: Get the count of completed invoices for a specific client
 *     description: Returns the total number of invoices with the status "Completed" for the specified client of the authenticated user.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: ID of the client for whom to count completed invoices
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved count of completed invoices for the specified client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalCompletedInvoices:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized - User not authenticated
 *       400:
 *         description: Bad Request - Client not found or does not belong to the user
 *       500:
 *         description: Internal server error
 */
Router.get('/invoice-count', authenticateUser, totalInvoiceById);

/**
 * @swagger
 * /updateinvoice/{invoiceId}:
 *   put:
 *     summary: Update an existing invoice
 *     description: Allows the user to update the details of a draft invoice identified by invoiceId.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: invoiceId
 *         in: path
 *         required: true
 *         description: ID of the invoice to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Draft"
 *               clientId:
 *                 type: string
 *                 example: "60c72b2f9b1e8f001f0f4b3a"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: "Web Design Service"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     rate:
 *                       type: number
 *                       example: 150.00
 *               issueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-30"
 *               phoneNumber:
 *                 type: string
 *                 example: "+123456789"
 *               email:
 *                 type: string
 *                 example: "client@example.com"
 *               accountDetailsId:
 *                 type: string
 *                 example: "60c72b2f9b1e8f001f0f4b3b"
 *     responses:
 *       200:
 *         description: Successfully updated the invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invoice updated successfully"
 *                 invoice:
 *                   type: object
 *                   additionalProperties: true
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Not Found - Invoice not found
 *       400:
 *         description: Bad Request - Only invoices with status "Draft" can be updated
 *       500:
 *         description: Internal server error
 */
Router.put('/updateinvoice/:invoiceId', authenticateUser, updateInvoice);

/**
 * @swagger
 * /delete/{invoiceId}:
 *   delete:
 *     summary: Delete an existing invoice
 *     description: Deletes an invoice identified by invoiceId for the authenticated user.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: invoiceId
 *         in: path
 *         required: true
 *         description: ID of the invoice to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invoice deleted successfully"
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Not Found - Invoice not found
 *       500:
 *         description: Internal server error
 */
Router.delete('/delete/:invoiceId', authenticateUser, deleteInvoice);

/**
 * @swagger
 * /download/{invoiceId}:
 *   get:
 *     summary: Download an invoice as PDF
 *     description: Retrieves an invoice by ID and generates a downloadable PDF file for it.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: invoiceId
 *         in: path
 *         required: true
 *         description: ID of the invoice to download
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file of the invoice successfully generated and ready for download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized - User not authenticated
 *       404:
 *         description: Not Found - Invoice not found
 *       400:
 *         description: Bad Request - Invoice number missing
 *       500:
 *         description: Internal server error - Error generating PDF or downloading file
 */
Router.get('/download/:invoiceId', authenticateUser, downloadInvoice);

/**
 * @swagger
 * /share/{invoiceIds}/{email}:
 *   post:
 *     summary: Share invoices via email
 *     description: Generates PDF files for specified invoices and sends them to the provided email address.
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: invoiceIds
 *         in: path
 *         required: true
 *         description: Comma-separated list of invoice IDs to be shared
 *         schema:
 *           type: string
 *       - name: email
 *         in: path
 *         required: true
 *         description: Email address to which the invoices will be sent
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: PDFs generated and shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       path:
 *                         type: string
 *       401:
 *         description: Unauthorized - User not found
 *       400:
 *         description: Bad Request - Invalid invoice IDs provided
 *       404:
 *         description: Not Found - No invoices found for the given IDs
 *       500:
 *         description: Internal server error - Failed to generate PDFs or error rendering email template
 */
Router.post('/share/:invoiceIds/:email', authenticateUser, shareInvoices);


export default Router;