const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const request = require('request');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const config = require('config');
const { check, validationResult } = require('express-validator');


// @ route post api/posts
// @desc create a post
// @access private

router.post('/',[auth, [
    check('text', 'text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newPost.save();
        res.json(post);
        
    } catch (err) {
        res.status(500).send('Server Error')
    }

})

// @ route get api/posts
// @desc get all posts
// @access private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).send('server error')
    }
})

// @ route get api/posts/:id
// @desc get  post by id
// @access private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post){
            return res.status(404).send({msg:'Post not found'});
        }
        res.json(post);
    } catch (err) {
        if (err.kind === 'ObjectId'){
            return res.status(404).send({msg:'Post not found'});
        }
        res.status(500).send('server error')
    }
})

// @ route delete api/posts/:id
// @desc delete  post by id
// @access private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post){
            return res.status(404).send({msg:'Post not found'});
        }
        if (post.user.toString() !== req.user.id){
            return res.status(401).send({msg:'User Not Authorized'});
        }
        await post.remove();
        res.json({msg: 'post removed'});
    } catch (err) {
        if (err.kind === 'ObjectId'){
            return res.status(404).send({msg:'Post not found'});
        }
        res.status(500).send('server error');
    }
})

// @ route PUT api/posts/like//:id
// @desc like a post
// @access private

router.put('/like/:id',auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if this post has already been liked by this user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: "post already liked"});
        }
        post.likes.unshift({ user: req.user.id });
        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.status(500).send('Server Error');
    }
} )

// @ route PUT api/posts/like//:id
// @desc unlike a post
// @access private

router.put('/unlike/:id',auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // check if this post has already been liked by this user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: "post has not yet been liked"});
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);
        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.status(500).send('Server Error');
    }
} )

// @ route post api/posts/comment//:id
// @desc commant on a post
// @access private

router.post('/comment/:id',[auth, [
    check('text', 'text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
        
    } catch (err) {
        res.status(500).send('Server Error');
    }

})

// @ route post api/posts/comment/:id/:comment_id
// @desc delete a comment on a post
// @access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) res.status(404).json({msg: "Comment does not exist"});
        // check the user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "not authorized"});
        }
        console.log('here')
        const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);
        await post.save();
        res.json(post.comments);
        
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

module.exports = router;
