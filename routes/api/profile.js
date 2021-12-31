const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator')

// @ route GET api/profile/me
// @desc get current users profile
// @access private

router.get('/me',auth, async (req, res) => {
    try {
        profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if (!profile){
            return res.status(400).json({msg: "There is no profile for this user"}); 
        }
        res.json(profile)
    } catch (err) {
        res.status(500).send("Server Error")
    }
})

// @ route post api/profile
// @desc create or update user profile
// @access private

router.post('/',[auth, [
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()}); 
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.webiste = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    profileFields.social = {}
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try {
        let profile = await Profile.findOne({user:req.user.id });
        // update
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id}, 
                {$set: profileFields},
                {new: true}
                );
            return res.json(profile)
        }
        // create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);


    } catch (err) {
        res.status(500).send('Server Error');
    }
})

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles);
    } catch (err) {
        res.status(500).send('Server Error')
    }
})

// get api/profile/user/:user_id
// @desc get profile by user id
// @access public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile){
            return res.status(400).json({msg: "there is no profile for this user"})
        }
        res.json(profile);
    } catch (err) {
        if (err.kind == "ObjectId") {
            return res.status(400).json({msg: "there is no profile for this user"})
        }
        res.status(500).send('Server Error')
    }
})

// Delete api/profile
// @desc delete profile
// @access private

router.delete('/',auth,  async (req, res) => {
    try {
        // @todo remove users posts

        // remove profile
        const profile = await Profile.findOneAndRemove({ user: req.user.id });
        const User = await Profile.findOneAndRemove({ _id: req.user.id });
       
        res.json({msg: 'User deleted'});
    } catch (err) {
        if (err.kind == "ObjectId") {
            return res.status(400).json({msg: "there is no profile for this user"})
        }
        res.status(500).send('Server Error')
    }
})

module.exports = router;
