// require('dotenv').config({path: '.env'});
import dotenv from 'dotenv';
dotenv.config({path: '.env'});
import app from './app.js';

import connectDB from './db/index.js';
connectDB()
.then(()=>{
      app.listen(process.env.PORT ||3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
      })
})
.catch((error)=>{
  console.error('Failed to connect to the database:', error);
  process.exit(1);
});