import express from 'express';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./Routes/authRoutes');

app.use('/api/auth', authRoutes);

export default app;
