import { Schema, Types, model } from 'mongoose';

const commentSchema = new Schema({
    content: { type: String, required: true },
    blog: { type: Types.ObjectId, ref: 'Blog' },
    author: { type: Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model('Comment', commentSchema);