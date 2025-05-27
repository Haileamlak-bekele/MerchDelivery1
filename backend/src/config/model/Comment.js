// models/Comment.js

const mongoose = require('mongoose');


const CommentSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type:mongoose.Schema.Types.ObjectId, ref: 'Users ',  required: true },
  userName: {type:String, required:true},
  text: { type: String, required: true },
  rating :{type: String, required:true},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema);
