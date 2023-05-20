import dotenv from 'dotenv'
dotenv.config()

export const { PORT,  MONGODB_CONNECT_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, BACKEND_SERVER_PATH } = process.env
