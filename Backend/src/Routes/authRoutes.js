import express from 'express';
import { Router } from 'express';
import { validateSignIn } from '../validators/validateSignIn.js';
import { validateLogIn } from '../validators/validateLogin.js';
import { signUp, logIn, logOut } from '../controllers/authController.js';
import { verifyJWT } from '../middleWares/verifyJWT.js';

const router = Router();

router.get('/me', verifyJWT, (req, res) => {
    return res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

router.post('/signup', validateSignIn, signUp);

router.post('/login', validateLogIn, logIn);

router.post('/logout', logOut)

export default router;