const express = require('express');
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
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






module.exports = router;