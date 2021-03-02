const express =require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var config= require('config')

const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../../models/User')

// @route POST api/users
// @Desc register user
// @access Public 

router.post(
    '/',
    body('name', 'Name is Required!').isLength({max:50}),
    body('email', 'Please enter Valid Email!').isEmail(),
    body('password', 'Please enter Password with 5 or more character! ').isLength({ min: 5 }),
    async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
// User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     }).then(user => res.json(user));
    //res.send('User Route')

const {name, email, password} =req.body;
try {
    //see if user exit
    let user = await User.findOne({email})
    if (user){
        return res.status(400).json({errors:[{msg:'users Already Exits!'}] });
    }
    //get users gravatar 
    var avatar = gravatar.url('email', {
        s: '200',
        r: 'pg',
        d: 'mm'
        });
    //encrypt password
    user = new User({
        name,
        email,
        avatar,
        password
    })
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();
    //Return jsonwebtoken

    const payload={
        user:{
            id:user.id
        }
    };
    jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn:360000},
        (err,token)=>{
            if(err) throw err;
            res.json({token})
            });

} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!')
}
},);


module.exports =router;