import Joi from "joi";
import Comment from "../model/Comment.js";
import CommentDTO from './../dto/commentDto.js';

const mongoDBIdPattern = /^[0-9a-fA-F]{24}$/

const commentController = {
    async create(req, res, next) {
        // validate
        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongoDBIdPattern).required(),
            blog: Joi.string().regex(mongoDBIdPattern).required()
        })
        const { error } = createCommentSchema.validate(req.body)
        if (error) return next(error)
        // send response
        const { content, author, blog } = req.body
        let newComment
        try {
            newComment = new Comment({ content, author, blog })
            await newComment.save()
        } catch (error) {
            return next(error)
        }
        return res.status(200).json({
            message: 'Comment Created Successfully',
        })
    },
    async getById(req, res, next) {
         // validate
         const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongoDBIdPattern).required()
        })
        const { error } = getByIdSchema.validate(req.params)
        if (error) return next(error)
        // send response
        const { id } = req.params
        let comments
        try{
            comments = await Comment.find({ blog: id }).populate('author')
        } catch(error){
            return next(error)
        }
        let commentsDto = []
        for (let i = 0; i < comments.length; i++) {
            const obj = new CommentDTO(comments[i])
            commentsDto.push(obj)
        } 
        return res.status(200).json({
            totalComments: comments.length,
            data: commentsDto
        })
    }
}

export default commentController