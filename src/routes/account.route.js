import express from 'express';
import { addAccount, getAccounts, updateAccount, getAccountById, deleteAccount } from '../controllers/account.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

Router.post('/addaccount', authenticateUser, addAccount);
Router.get('/getaccounts', authenticateUser, getAccounts);
Router.put('/updateaccount/:accountId', authenticateUser, updateAccount);
Router.get('/getaccount/:accountId', authenticateUser, getAccountById);
Router.delete('/deleteaccount/:accountId', authenticateUser, deleteAccount);

export default Router;