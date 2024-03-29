const mongoose = require('mongoose');
const router = require('express').Router();
const User = require('../../models/User');
const util = require('util');

const isAlreadyLogIn = (req, res, next) => {
  if (req.session.userId) {
    return res.status(403).json({ user: 'Already login'})
  } else {
    next();
  }
}

router.get('/user', async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).end();
  }

  try {
    const user = await User.findById(req.session.userId);
    return res.status(200).json(user.userToJSON());
  } catch (error) {
    next(error);
  }
})

router.post('/users/login', isAlreadyLogIn, async (req, res, next) => {
  const { email, password } = req.body;

  if(!email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  try {
    user = await User.findOne({ email });

    if(!user) {
      return res.status(401).json({errors: {error: 'Email or password is incorrect'}});
    }

    if(!await user.validPassword(password)) {
      return res.status(401).json({errors: {error: 'Email or password is incorrect'}});
    }

    req.session.userId = user.id;
    return res.status(200).json({ user: { username: user.username, email: user.email } })

  } catch (error) {
    next(error);
  }
});

router.post('/users/logout', (req, res, next) => {
  if (req.session.userId) {
    req.session.destroy();
    res.clearCookie(process.env.SESS_NAME);
  }

  return res.status(200).send();
});

router.post('/users', isAlreadyLogIn, async (req, res, next) => {
  const user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  
  try {
    await user.save();

    req.session.userId = user.id;

    return res.json(user.userToJSON());
  } catch (error) {
     next(error);
  }
})

router.put('/users', async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send()
  }
  
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401);
    }

    const { username, email, password } = req.body;

    if (typeof username !== undefined) {
      user.username = username;
    }

    if (typeof email !== undefined) {
      user.email = email;
    }

    if (typeof password !== undefined) {
      user.password = password;
    }

    await user.save()
    res.json(user.userToJSON())
  } catch (error) {
    next(error);
  }
})

router.delete('/users', async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send()
  }

  try {
    const user = await User.findById(req.session.userId);
    
    if(!user) {
      return res.status(401).send();
    }
    
    await User.findByIdAndDelete(user);
    
    req.session.destroy();
    res.clearCookie(process.env.SESS_NAME);

    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;