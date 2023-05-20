import UserDTO from "../dto/user.js"
import User from "../model/User.js"
import JWTService from "../services/JWTServices.js"

const auth = async (req, _res, next) => {
    try {
        // 1. refresh, access token validation
        const { accessToken, refreshToken } = req.cookies
        if (!accessToken || !refreshToken) {
            const error = {
                status : 401,
                message: 'Unauthorized'
            }
            return next(error)
        }
        let _id
        try {
            _id = JWTService.verfyAccessToken(accessToken)._id
        } catch (error) {
            return next(error)
        }
        let user
        try {
            user = await User.findOne({ _id })
        } catch (error) {
            return next(error)
        }
        const userDto = new UserDTO(user)
        req.user = userDto
        next()
    } catch (error) {
        return next(error)
    }
}

export default auth;