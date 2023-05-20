import { PORT } from './config/envFiles.js';

import express from 'express';
import dbConnection from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import colors from 'colors'
const app = express()

app.use('/public/images', express.static('public/images'))

app.use([ express.json(), cookieParser() ])

// database connection
dbConnection()

// global routes
app.use(router)

// error handler
app.use(errorHandler)

const port = PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`.bgGreen.white))