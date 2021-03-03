const express = require('express');
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @route GET api/profile/me
// @Desc Get Profile user
// @access Public 

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avavtar'])
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.send(500).send('Server Error!')

    }
});

// @route GET api/profile/me
// @Desc Create update user profile
// @access Private
router.post('/',
    auth,
    [
        body('status', 'Status is Requires').not().isEmpty(),
        body('skills', 'Skill is Required!').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        // destructure the request
        const {
            company,
            website,
            location,
            bio,
            githubusername,
            skills,
            status,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
            // spread the rest of the fields we don't need to check
            ...rest
        } = req.body;
        //build profile Object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (githubusername) profileFields.githubusername = githubusername;
        if (status) profileFields.status = status;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        //Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (facebook) profileFields.social.facebook = facebook;
        // console.log(profileFields.skills);
        // console.log(profileFields.social.twitter)
        // res.send('Hello')
        try {

            let profile = await Profile.findOne({ user: req.user.id })

            if (profile) {
                //Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }
            //Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);


        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error!')
        }


    }
);

// @route GET api/profile/
// @Desc GET profile
// @access Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error!')

    }
})

// @route GET api/profile/user/:user_id
// @Desc GET profile by user id
// @access Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) res.status(400).json('Profile Not Found!');
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json('Profile Not Found!');
        }
        res.status(500).send('Server Error!')

    } 
})



module.exports = router;