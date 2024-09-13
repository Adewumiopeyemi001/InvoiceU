import express from 'express';
import { addClient, getClientById, getClientsByUserId, updateClient, searchClient, filterClients, deleteClient } from '../controllers/clients.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/addclient', authenticateUser, addClient);
Router.get('/getallclient', authenticateUser, getClientsByUserId);
Router.get('/getclient/:clientId', authenticateUser, getClientById);
Router.put('/updateclient/:clientId', authenticateUser, updateClient);
Router.get('/client/search', authenticateUser, searchClient);
Router.get('/client/filter', authenticateUser, filterClients);
Router.delete('/client/:clientId', authenticateUser, deleteClient);



export default Router;