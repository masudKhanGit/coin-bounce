import bcrypt from 'bcryptjs';
import Joi from 'joi';
import UserDTO from '../dto/user.js';
import RefreshToken from '../model/Token.js';
import User from '../model/User.js';
import JWTService from '../services/JWTServices.js';
import errorService from '../services/errorServices.js';

// Minimum 8 and maximum 20 characters, at least one uppercase letter, one lowercase letter, one number and one special character:
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const authController = {
    async register(req, res, next) {
        // we expect input data to be in such shape
        // 1. validate user input
        const userRegisterSchema = Joi.object({
            name: Joi.string().max(30).required(),
            username: Joi.string().min(5).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        })
        const { error } = userRegisterSchema.validate(req.body)
        // 2. if error in validation -> return error vai middleware
        if(error) return next(error)
        // 3. if email or username is already registered -> return an error
        const { name, username, email, password } = req.body

        try {
            const emailInUse = await User.exists({ email })
            const usernameInUser = await User.exists({ username })
            errorService(emailInUse, 409, 'Email already registered, please use another email', next)
            errorService(usernameInUser, 409, 'UserName Not available, chose another username', next)
        } catch(error) {
            return next(error)
        }
        // 4. pasword hash
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        // 5. store user data in db
        let accessToken
        let refreshToken
        let user
        try {
            const userToRegister = new User({ name, username, email, password: hash })
            user = await userToRegister.save()
            // token generate
            accessToken = JWTService.signAccessToken({_id: user._id}, '30m')
            refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m')
        } catch(error) {
            return next(error)
        }

        // store refresh token in db
        await JWTService.storeRefreshToken(refreshToken, user._id)
        // send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // XSS attack
        })
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // XSS attack
        })

        // DTO (data transfer object)
        const userDto = new UserDTO(user)
        // 6. response send
        return res.status(201).json({
            user: userDto,
            auth: true
        })
    },
    async login(req, res, next) {
        // we expect input data to be in such shape
        // 1. validate user input
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern)
        })
        const { error } = userLoginSchema.validate(req.body)
        // 2. if validation error, return error
        if(error) return next(error)
        // 3. match username and password
        const { username, password } = req.body
        let user;
        try {
            // match username
            user = await User.findOne({ username })
            errorService(!user, 401, 'Invalid username', next)
            // match password
            const match = await bcrypt.compare(password, user.password)
            errorService(!match, 401, 'Invalid password', next)
        } catch(e) {
            return next(e)
        }
        // token 
        const accessToken = JWTService.signAccessToken({_id: user._id}, '30m')
        const refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m')

        // update refresh token in db
        try {
            await RefreshToken.updateOne({
                _id: user._id
            }, { token: refreshToken }, { upsert: true })
        } catch (e) {
            return next(e)
        }
        
        // cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // XSS attack
        })
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true // XSS attack
        })

        // dto (data transfer object)
        const userDTO = new UserDTO(user)

        // 4. return response
        return res.status(200).json({
            user: userDTO,
            auth: true
        })
    },
    async logout(req, res, next) {
        // 1. delete refresh token from db
        const { refreshToken } = req.cookies
        try {
            await RefreshToken.deleteOne({ token: refreshToken })
        } catch (error) {
            return next(error)
        }
        // delete cookies
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        // 2. response
        res.status(200).json({
            user: null, 
            auth: false
        })
    },
    async refresh(req, res, next) {
        // 1. get refreshToken from cookies
        const originalRefreshToken = req.cookies.refreshToken;
        let _id;
        try {
            _id = JWTService.verifyRefreshToken(originalRefreshToken)._id
        } catch (e) {
            const error = {
                status: 401,
                message: 'Unauthorized',
            }
            return next(error)
        }
        // 2. verify refreshToken
        try {
            const match = await RefreshToken.findOne({ _id, token: originalRefreshToken })
            errorService(!match, 401, 'Unauthorized', next)
        } catch (error) {
            return next(error)
        }
        // 3. generate new token, update database
        try {
            const accessToken = JWTService.signAccessToken({_id}, '30m')
            const refreshToken = JWTService.signRefreshToken({_id}, '60m')
            await RefreshToken.updateOne({_id}, {token: refreshToken})
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })
        } catch (error) {
            return next(error)
        }
        // 4. return response
        const user = await User.findOne({ _id })
        const userDto = new UserDTO(user)
        res.status(200).json({
            user: userDto,
            auth: true
        })
    }
}

export default authController;