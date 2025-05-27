// controllers/commentController.js

const Comment = require('../src/config/model/Comment');
const Product = require('../src/config/model/Products.model');


const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id});

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
};

const getRaletedProduct = async (req, res) => {
  const { catagory } = req.params;
  const product = await Product.find({ category: catagory});

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
};

const addComment = async (req, res) => {
  const { productId } = req.params; // Extract productId from URL parameters
  const { userId,userName, text, rating } = req.body; // Extract other fields from the request body

  // Validate input
  if (!productId || !userId || !text || !rating) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Create a new comment
    const comment = new Comment({ productId, userId,userName, text, rating });

    // Save the comment to the database
    await comment.save();

    // Log the successful addition of the comment
    console.log(`Comment added successfully: ${comment._id}`);

    // Optionally, integrate with other services, e.g., send a notification
    // await sendNotification(userId, `Your comment on product ${productId} has been added.`);

    // Return the created comment
    res.status(201).json(comment);
  } catch (error) {
    // Log the error for debugging purposes
    console.error(`Error adding comment: ${error.message}`);

    // Return a detailed error message
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get comments for a product
const getComments = async (req, res) => {
  const { productId } = req.params;

  try {
    const comments = await Comment.find({ productId });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/ratingController.js





module.exports = {

  addComment,
  getComments,
  getRaletedProduct,
  getSingleProduct
};
