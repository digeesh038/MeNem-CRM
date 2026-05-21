import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  addActivity,
  getStats,
} from '../controllers/customerController.js';

const router = express.Router();

// Dashboard stats — declared before "/:id" so "stats" isn't treated as an id
router.get('/stats', getStats);

// Main customer CRUD
router.get('/', getAllCustomers);     // list customers
router.post('/', createCustomer);     // create new customer
router.get('/:id', getSingleCustomer);// get one by id
router.put('/:id', updateCustomer);   // update one
router.delete('/:id', deleteCustomer);// delete one

// Add an activity to a specific customer's timeline
router.post('/:id/activities', addActivity);

export default router;
