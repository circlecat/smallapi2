const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');

router.post('/users/login', (req, res, next) => {
  if (!req.body.user.email) {
    return res.status(422).json( { errors: { email: `can't be blank` }} )
  }

  if (!req.body.user.password) {
    return res.status(422).json( { errors: { passwort: `can't be blank` }} )
  }

  
})

router.post('/users', async (req, res) => {
  let user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  
  try {
    await user.save();

    req.session.userId = user.id;
    
    return res.json({ user: { username: user.username, email: user.email } });
  } catch (error) {
    throw error;
  }
})

module.exports = router;