import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/envFiles.js'
import RefreshToken from '../model/Token.js'

class JWTService {
    // sign access token
    static signAccessToken(payload, expiryTime) {
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime })
    }
    // sign refresh token
    static signRefreshToken(payload, expiryTime) {
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime })
    }
    // verify access token
    static verfyAccessToken(token) {
        return jwt.verify(token, ACCESS_TOKEN_SECRET)
    }
    // verify refresh token
    static verifyRefreshToken(token) {
        return jwt.verify(token, REFRESH_TOKEN_SECRET)
    }
    // store refresh token
    static async storeRefreshToken(token, userId) {
        try {
            const newToken = new RefreshToken({ token, userId })
            // store in db
            await newToken.save()
        } catch (e) {
            console.log(e);
        }
    }
}

export default JWTService