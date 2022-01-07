const express = require('express');
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator')

// @ route GET api/profile/me
// @desc get current users profile
// @access private

router.get('/me',auth, async (req, res) => {
    try {
        profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        /*if (!profile){
            return res.status(400).json({msg: "There is no profile for this user"}); 
        }*/
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

// put api/profile/experience
// @desc add profile experience
// @access private

router.put('/experience', [auth, [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;
    const newExp = {
        title, company, location, from, to, current, description
    };
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile)

    } catch (err) {
        res.status(500).send('Server Error')
    }
})


// delete api/profile/experience/:exp_id
// @desc delete experience from profile
// @access private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        // get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        res.status(500).send('Server error')
    }
})

// put api/profile/education
// @desc add profile education
// @access private
router.put('/education', [auth, [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;
    const newEdu = {
        school,
        degree,
        fieldofstudy,
         from, to, current, description
    };
    try {
        const profile = await Profile.findOne({user: req.user.id});
        profile.education.unshift(newEdu);
        await profile.save()
        res.json(profile)

    } catch (err) {
        res.status(500).send('Server Error')
    }
})


// delete api/profile/education/:edu_id
// @desc delete education from profile
// @access private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        // get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (err) {
        res.status(500).send('Server error')
    }
})

// get api/profile/githhub/:username
// @desc get user repos from github
// @access public

router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&clien_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };
        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200){
                return res.status(404).json({msg: 'no Github profile found'})
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.log(err)
        res.status(500).send('Server Error');
    }

})
module.exports = router;
