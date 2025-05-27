const express = require('express');
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware
const FeedbackController = require ('../controllers/Feedback.js')
const router = express.Router();
 
router.get('/comments/:productId',FeedbackController.getComments)
router.get("/product/:id",FeedbackController.getSingleProduct);
router.get('/related/:catagory',FeedbackController.getRaletedProduct);
router.post('/comment/:productId',FeedbackController.addComment);
// Export the router
module.exports = router;
