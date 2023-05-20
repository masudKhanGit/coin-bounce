import fs from "fs";
import Joi from "joi";
import { BACKEND_SERVER_PATH } from '../config/envFiles.js';
import BlogDetailsDTO from "../dto/blog-details.js";
import Blog from '../model/Blog.js';
import Comment from '../model/Comment.js';
import BlogDTO from './../dto/blogDto.js';

const mongoDBIdPattern = /^[0-9a-fA-F]{24}$/

const blogController = {
    async create(req, res, next) {
        // 1. validate req body
            // client side -> base64 encoded string -> decode -> store -> save photo's path in database
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongoDBIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()
        })
        const { error } = createBlogSchema.validate(req.body)
        if (error) return next(error)
        // 2. handle photo storage, naming
        const { title, author, content, photo } = req.body
            // read as buffer
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')
            // allot a random name
            const imagePath = `${Date.now()}-${author}.png`
            // save locally
            try {
                fs.writeFileSync(`public/images/${imagePath}`, buffer)
            } catch (error) {
                return next(error)
            }
        // 3. save blog db
        let newBlog
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/public/images/${imagePath}`
            })
            await newBlog.save()
        } catch (error) {
            return next(error)
        }
        // 4. response
        const blogDto = new BlogDTO(newBlog)
        return res.status(201).json({blogDto})
    },
    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({})
            const blogDto = []
            for(let i = 0; i < blogs.length; i++) {
                const dto = new BlogDTO(blogs[i])
                blogDto.push(dto)
            }
            return res.status(200).json({
                totalBlogs: blogDto.length,
                blogs: blogDto
            })
        } catch (error) {
            return next(error)
        }
    },
    async getById(req, res, next) {
        // validate id
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongoDBIdPattern).required()
        })
        const { error } = getByIdSchema.validate(req.params)
        if (error) return next(error)
        // send response
        let blog
        const {id} = req.params
        try {
            blog = await Blog.findOne({ _id: id }).populate('author')
        } catch (error) {
            return next(error)
        }
        const blogDto = new BlogDetailsDTO(blog)
        return res.status(200).json({ blog: blogDto })
    },
    async update(req, res, next) {
        // validate
        const updateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            author: Joi.string().regex(mongoDBIdPattern).required(),
            blogId: Joi.string().regex(mongoDBIdPattern).required(),
            photo: Joi.string()
        })
        const { error } = updateBlogSchema.validate(req.body)
        if (error) return next(error)
        // send response
        const { title, content, author, blogId, photo } = req.body
            // delete previous photo
            let blog
            try {
                blog = await Blog.findOne({ _id: blogId })
            } catch (error) {
                return next(error)
            }
            if(photo) {
                let previousPhoto = blog.photoPath
                previousPhoto = previousPhoto.split('/').at(-1) // 12133-42121.png
                // delete photo
                fs.unlinkSync(`public/images/${previousPhoto}`)

                // save new photo
                // read as buffer
                const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')
                // allot a random name
                const imagePath = `${Date.now()}-${author}.png`
                // save locally
                try {
                    fs.writeFileSync(`public/images/${imagePath}`, buffer)
                } catch (error) {
                    return next(error)
                }
                await Blog.updateOne({ _id: blogId }, {title, content, photoPath: `${BACKEND_SERVER_PATH}/public/images/${imagePath}`})
            } else {
                await Blog.updateOne({ _id: blogId }, { title, content })
            }
            return res.status(200).json({
                message: 'Blog updated successfully'
            })
    },
    async delete(req, res, next) {
        // validate id
        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongoDBIdPattern).required()
        })
        const { error } = deleteBlogSchema.validate(req.params)
        if (error) return next(error)
        const { id } = req.params
        // delete blog
        try {
            await Blog.deleteOne({ _id: id })
            
            // delete comments
            await Comment.deleteOne({ blog: id })
        } catch (error) {
            return next(error)
        }
        // send response
        return res.status(200).json({ message: 'Blog Delete Successfully' })
    }
}

export default blogController