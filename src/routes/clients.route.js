import express from 'express';
import { addClient, getClientById, getClientsByUserId } from '../controllers/clients.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/addclient', authenticateUser, addClient);
Router.get('/getallclient', authenticateUser, getClientsByUserId);
Router.get('/getclient/:clientId', authenticateUser, getClientById);


export default Router;