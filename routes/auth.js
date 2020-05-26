const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require('../validation');


router.post('/register', async (req, res) => {
    // Validate the data before registering a user
    const {error} = registerValidation(req.body);
    if(error) {
        return res.status(400).send(error.details[0].message)
    }

    // Checking if user is already in database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) {
        return res.status(400).send('Email already exists');
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Creating a new user
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        let savedUser = await user.save();
        res.send({user: user._id});
    } catch(err) {
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    const {error} = loginValidation(req.body);
    if(error) {
        return res.status(400).send(error.details[0].message)
    }

    // check email
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return res.status(400).send('Email doesn\'t exists');
    }

    // match password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) {
        return res.status(400).send('Invalid Password');
    }

    // Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);

    // res.send('Logged in')
});


module.exports = router;
