const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// @route   POST /api/users
// @desc    Register/Create a new user
// @access  Public
router.post('/', UserController.createUser);

// @route   GET /api/users/:id
// @desc    Get user data
// @access  Private
router.get('/:id', UserController.getUser);

// @route   PUT /api/users/:id
// @desc    Update user data
// @access  Private
router.put('/:id', UserController.updateUser);

module.exports = router;