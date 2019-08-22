const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const util = require('util');

const isAlreadyLogIn = (req, res, next) => {
  if (req.session.userId) {
    return res.status(403).json({ user: 'Already login'})
  } else {
    next();
  }
}

router.post('/users/login', async (req, res, next) => {
  const { email, password } = req.body;

  if(!email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  const findOne = util.promisify(User.findOne).bind(User);

  try {
    user = await User.findOne({ email });
    if(!user) {
      return res.status(401).json({errors: {error: 'Email or password is incorrect'}});
    }

    if(await !user.validPassword(password)) {
      return res.status(401).json({errors: {error: 'Email or password is incorrect'}});
    }

    req.session.userId = user.id;
    return res.status(200).json({ user: { username: user.username, email: user.email } })

  } catch (error) {
    console.log(1);
    next(error);
  }
})

router.post('/users', /*isAlreadyLogIn,*/ async (req, res, next) => {
  let user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  
  try {
    console.log(user);
    await user.save();

    req.session.userId = user.id;

    return res.json({ user: { username: user.username, email: user.email } });
  } catch (error) {
     next(error);
  }
})

module.exports = router;