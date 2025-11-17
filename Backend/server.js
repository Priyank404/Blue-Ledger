import dotenv from 'dotenv';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

dotenv.config();

app.listen(PORT,()=>{
    console.log("server is running successfully");  
})