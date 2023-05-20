import express from 'express';
import authController from '../controller/authController.js';
import blogController from '../controller/blogController.js';
import commentController from '../controller/commentController.js';
import auth from '../middleware/auth.js';
const router = express.Router()

// register
router.post('/register', authController.register)
// login
router.post('/login', authController.login)
// logout
router.post('/logout', auth, authController.logout)
// refresh
router.get('/refresh', authController.refresh)

// blog
// create
router.post('/blog', auth, blogController.create)
// get all
router.get('/blog/all', auth, blogController.getAll)
// get blog by id
router.get('/blog/:id', auth, blogController.getById)
// update
router.put('/blog', auth, blogController.update)
// delete
router.delete('/blog/:id', auth, blogController.delete)

// comment
// create
router.post('/comment', auth, commentController.create)
// get
router.get('/comment/:id', auth, commentController.getById)

export default router;