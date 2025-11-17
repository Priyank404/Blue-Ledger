import express from 'express';
import { Router } from 'express';
import { validateSignIn } from '../validators/validateSignIn';
import { validateLogIn } from '../validators/validateLogin';

const router = Router();

router.post('/signup', validateSignIn, signUp);

router.post('/login', validateLogIn, logIn);