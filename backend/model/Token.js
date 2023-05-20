import { Schema, Types, model } from 'mongoose'

const refreshTokenSchema = new Schema({
    token: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default model('RefreshToken', refreshTokenSchema)