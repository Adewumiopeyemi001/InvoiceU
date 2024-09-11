import express from 'express';
import { addClient } from '../controllers/clients.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/addclient', authenticateUser, addClient)


export default Router;