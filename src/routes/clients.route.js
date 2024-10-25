import express from 'express';
import { addClient, getClientById, getClientsByUserId, updateClient, searchClient, filterClients, deleteClient, totalClients } from '../controllers/clients.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

/**
 * @swagger
 * /addclient:
 *   post:
 *     summary: Add a new client
 *     description: This endpoint allows an authenticated user to add a new client to their account. The user must have completed their company profile before adding clients.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - clientIndustry
 *               - email
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: The name of the client's business
 *                 example: "Tech Innovations Ltd."
 *               clientIndustry:
 *                 type: string
 *                 description: The industry in which the client's business operates
 *                 example: "Technology"
 *               email:
 *                 type: string
 *                 description: The client's business email
 *                 example: "client@example.com"
 *               country:
 *                 type: string
 *                 description: The country where the client's business is located
 *                 example: "USA"
 *               city:
 *                 type: string
 *                 description: The city where the client's business is located
 *                 example: "New York"
 *               zipCode:
 *                 type: string
 *                 description: The zip code of the client's business
 *                 example: "10001"
 *               address:
 *                 type: string
 *                 description: The address of the client's business
 *                 example: "123 Main Street"
 *     responses:
 *       201:
 *         description: Client added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 client:
 *                   type: object
 *                   properties:
 *                     businessName:
 *                       type: string
 *                       example: "Tech Innovations Ltd."
 *                     clientIndustry:
 *                       type: string
 *                       example: "Technology"
 *                     email:
 *                       type: string
 *                       example: "client@example.com"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     zipCode:
 *                       type: string
 *                       example: "10001"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street"
 *                     user:
 *                       type: string
 *                       description: The ID of the user who added the client
 *                       example: "605c5b2e6edb3000183456a7"
 *       400:
 *         description: Bad request, missing required fields or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please fill in the required fields"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Company profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Company profile not found. Please complete your profile."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.post('/addclient', authenticateUser, addClient);

/**
 * @swagger
 * /getallclient:
 *   get:
 *     summary: Get all clients by user ID
 *     description: This endpoint retrieves all clients associated with the authenticated user. Supports pagination with `page` and `limit` query parameters.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: The page number for pagination (default is 1)
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           description: The number of clients to return per page (default is 10)
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved list of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       businessName:
 *                         type: string
 *                         example: "Tech Innovations Ltd."
 *                       clientIndustry:
 *                         type: string
 *                         example: "Technology"
 *                       email:
 *                         type: string
 *                         example: "client@example.com"
 *                       country:
 *                         type: string
 *                         example: "USA"
 *                       city:
 *                         type: string
 *                         example: "New York"
 *                       zipCode:
 *                         type: string
 *                         example: "10001"
 *                       address:
 *                         type: string
 *                         example: "123 Main Street"
 *       400:
 *         description: Bad request, possible validation issues with query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid pagination parameters"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/getallclient', authenticateUser, getClientsByUserId);

/**
 * @swagger
 * /getclient/{clientId}:
 *   get:
 *     summary: Get a client by ID
 *     description: This endpoint retrieves a specific client by their ID, ensuring the authenticated user has access to that client.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the client to retrieve
 *           example: "605c5b2e6edb3000183456a7"
 *     responses:
 *       200:
 *         description: Successfully retrieved the client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 client:
 *                   type: object
 *                   properties:
 *                     businessName:
 *                       type: string
 *                       example: "Tech Innovations Ltd."
 *                     clientIndustry:
 *                       type: string
 *                       example: "Technology"
 *                     email:
 *                       type: string
 *                       example: "client@example.com"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     zipCode:
 *                       type: string
 *                       example: "10001"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street"
 *       400:
 *         description: Bad request, invalid client ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid client ID"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Client not found for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/getclient/:clientId', authenticateUser, getClientById);

/**
 * @swagger
 * /updateclient/{clientId}:
 *   put:
 *     summary: Update a client by ID
 *     description: This endpoint updates the details of a specific client by their ID, ensuring the authenticated user has access to that client.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the client to update
 *           example: "605c5b2e6edb3000183456a7"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: The updated name of the business
 *                 example: "Tech Innovations Ltd."
 *               clientIndustry:
 *                 type: string
 *                 description: The updated industry of the client
 *                 example: "Technology"
 *               email:
 *                 type: string
 *                 description: The updated email address of the client
 *                 example: "client@example.com"
 *               country:
 *                 type: string
 *                 description: The updated country of the client
 *                 example: "USA"
 *               city:
 *                 type: string
 *                 description: The updated city of the client
 *                 example: "New York"
 *               zipCode:
 *                 type: string
 *                 description: The updated zip code of the client
 *                 example: "10001"
 *               address:
 *                 type: string
 *                 description: The updated address of the client
 *                 example: "123 Main Street"
 *     responses:
 *       200:
 *         description: Successfully updated the client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 client:
 *                   type: object
 *                   properties:
 *                     businessName:
 *                       type: string
 *                       example: "Tech Innovations Ltd."
 *                     clientIndustry:
 *                       type: string
 *                       example: "Technology"
 *                     email:
 *                       type: string
 *                       example: "client@example.com"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     city:
 *                       type: string
 *                       example: "New York"
 *                     zipCode:
 *                       type: string
 *                       example: "10001"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street"
 *       400:
 *         description: Bad request, possibly due to missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid request data"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Client not found for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.put('/updateclient/:clientId', authenticateUser, updateClient);

/**
 * @swagger
 * /client/search:
 *   get:
 *     summary: Search for clients by business name
 *     description: This endpoint allows users to search for their clients by providing a search query that matches the business name.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *           description: The search term to match client business names
 *           example: "Tech Innovations"
 *     responses:
 *       200:
 *         description: Successfully found clients matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the client
 *                         example: "605c5b2e6edb3000183456a7"
 *                       businessName:
 *                         type: string
 *                         description: The name of the business
 *                         example: "Tech Innovations Ltd."
 *                       clientIndustry:
 *                         type: string
 *                         description: The industry of the client
 *                         example: "Technology"
 *                       email:
 *                         type: string
 *                         description: The email address of the client
 *                         example: "client@example.com"
 *                       country:
 *                         type: string
 *                         description: The country of the client
 *                         example: "USA"
 *                       city:
 *                         type: string
 *                         description: The city of the client
 *                         example: "New York"
 *                       zipCode:
 *                         type: string
 *                         description: The zip code of the client
 *                         example: "10001"
 *                       address:
 *                         type: string
 *                         description: The address of the client
 *                         example: "123 Main Street"
 *       400:
 *         description: Bad request due to missing search query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Search query is required"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/client/search', authenticateUser, searchClient);

/**
 * @swagger
 * /client/filter:
 *   get:
 *     summary: Filter clients based on search criteria
 *     description: This endpoint allows users to filter their clients by providing optional search criteria such as business name, industry, and city.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           description: Search term to match client business names
 *           example: "Tech Innovations"
 *       - in: query
 *         name: industry
 *         required: false
 *         schema:
 *           type: string
 *           description: The industry to filter clients by (exact match)
 *           example: "Technology"
 *       - in: query
 *         name: city
 *         required: false
 *         schema:
 *           type: string
 *           description: The city to filter clients by (partial match)
 *           example: "New York"
 *     responses:
 *       200:
 *         description: Successfully filtered clients based on the provided criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The unique identifier for the client
 *                         example: "605c5b2e6edb3000183456a7"
 *                       businessName:
 *                         type: string
 *                         description: The name of the business
 *                         example: "Tech Innovations Ltd."
 *                       clientIndustry:
 *                         type: string
 *                         description: The industry of the client
 *                         example: "Technology"
 *                       email:
 *                         type: string
 *                         description: The email address of the client
 *                         example: "client@example.com"
 *                       country:
 *                         type: string
 *                         description: The country of the client
 *                         example: "USA"
 *                       city:
 *                         type: string
 *                         description: The city of the client
 *                         example: "New York"
 *                       zipCode:
 *                         type: string
 *                         description: The zip code of the client
 *                         example: "10001"
 *                       address:
 *                         type: string
 *                         description: The address of the client
 *                         example: "123 Main Street"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/client/filter', authenticateUser, filterClients);

/**
 * @swagger
 * /clientcount:
 *   get:
 *     summary: Get the total number of clients for the authenticated user
 *     description: This endpoint returns the total count of clients associated with the authenticated user.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     responses:
 *       200:
 *         description: Successfully retrieved the total number of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalClients:
 *                   type: integer
 *                   description: The total number of clients associated with the user
 *                   example: 15
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/clientcount', authenticateUser, totalClients);

/**
 * @swagger
 * /client/{clientId}:
 *   delete:
 *     summary: Delete a client
 *     description: This endpoint allows the authenticated user to delete a client by their ID.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []  # Requires JWT token for authentication
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         description: The ID of the client to be deleted
 *         schema:
 *           type: string
 *           example: "605c72d16f4d5f45e2d8a4d3"
 *     responses:
 *       200:
 *         description: Client deleted successfully
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
 *                   example: "Client deleted successfully"
 *       400:
 *         description: Bad request due to missing client ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Client ID is required"
 *       401:
 *         description: Unauthorized access, user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Client not found or not authorized to delete this client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Client not found or not authorized to delete this client"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.delete('/client/:clientId', authenticateUser, deleteClient);




export default Router;