// config/database.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const database = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Database connection failed:', error.message);
        process.exit(1); 
    }
}

export default database;
