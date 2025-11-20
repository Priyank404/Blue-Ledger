import express from 'express';
import { Router } from 'express';
import { validateSignIn } from '../validators/validateSignIn.js';
import { validateLogIn } from '../validators/validateLogin.js';
import { signUp, logIn, logOut } from '../controllers/authController.js';

const router = Router();

router.post('/signup', validateSignIn, signUp);

router.post('/login', validateLogIn, logIn);

router.post('/logout', logOut)

export default router;