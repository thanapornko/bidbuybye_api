const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

const userController = require('../controllers/user-controller');
const authenticate = require('../middlewares/authenticate');

router.patch(
  '/',
  authenticate,
  upload.single('profilePicture'),
  userController.updateProfilePicture
);

router.patch('/info', authenticate, userController.updateUserInfo);

router.get('/history', authenticate, userController.userHistory);

module.exports = router;
