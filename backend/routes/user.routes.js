const express = require('express');
const router = express.Router();
const {addUser, getAllUsers, getUserById,DeleteUser,updateUser, loginUser} = require('../controllers/users.controller.js');


router.post('/add', addUser);
// router.get('/getAllUsers', getAllUsers);
// router.get('/getUserById/:id', getUserById);
// router.put('/updateUser/:id', updateUser);
// router.delete('/deleteUser/:id', DeleteUser);
router.post('/login', loginUser);

module.exports = router;