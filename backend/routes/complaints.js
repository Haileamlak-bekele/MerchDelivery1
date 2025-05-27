const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

// Create a Complaint
router.post('/', complaintController.createComplaint);

// Get All Complaints
router.get('/', complaintController.getAllComplaints);

// Get a Single Complaint
router.get('/:id', complaintController.getComplaint);

// Update a Complaint
router.patch('/:id', complaintController.updateComplaint);

// Delete a Complaint
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
