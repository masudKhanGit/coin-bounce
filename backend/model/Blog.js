import { Schema, Types, model } from 'mongoose';

const blogSchema = new Schema({
    title: { type: String, required: true},
    content: { type: String, required: true },
    photoPath: { type: String, required: true },
    author: { type: Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model('Blog', blogSchema);