import { MONGODB_CONNECT_URL } from './envFiles.js'
import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(MONGODB_CONNECT_URL);
        console.log(`Database connected host ${conn.connection.host}`.bgBlue.white)
    } catch (error) {
        console.log(`${error}`.bgRed.white);
    }
}

export default dbConnection;