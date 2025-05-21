const express = require('express');
const router = express.Router();
const multer = require('multer');
const {addUser, getAllUsers, getUserById,DeleteUser,updateUser, loginUser, getActiveDsps} = require('../controllers/users.controller.js');
const { uploadLicenseImage } = require('../middleware/Licence.js');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Use multer middleware for /add route
router.post(
    '/add',
    upload.fields([
        { name: 'tradeLicense', maxCount: 1 },
        { name: 'drivingLicense', maxCount: 1 }
    ]),
    addUser
);
// router.get('/getAllUsers', getAllUsers);
// router.get('/getUserById/:id', getUserById);
// router.put('/updateUser/:id', updateUser);
// router.delete('/deleteUser/:id', DeleteUser);
router.post('/login', loginUser);
router.get('/dsps/getActiveDsps', getActiveDsps);

module.exports = router;