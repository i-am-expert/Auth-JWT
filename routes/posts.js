const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
    res.json({posts: 
        {title: 'First Post', description: 'Random post desc'}
    })
})

module.exports = router;