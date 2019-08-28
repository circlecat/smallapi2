const router = require('express').Router();
const mongoose = require('mongoose');
const Todo = require('../../models/Todo');
const User = require('../../models/User');

const checkSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send()
  }
  return next();
}

router.get('/all', checkSession, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401);
    }

    const todos = await Todo.find({ author: user._id });

    res.json(todos.map(todo => todo.toJSON()));
  } catch (error) {
    next(error);
  }
})

router.post('/', checkSession, async (req, res, next) => {
  const { title, description, isFinished } = req.body;

  if(!title){
    return res.status(422).json({errors: { title: "can't be blank" }});
  }

  if(!description){
    return res.status(422).json({errors: { description: "can't be blank" }});
  }

  if(!isFinished){
    return res.status(422).json({errors: { isFinished: "can't be blank" }});
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401);
    }

    const todo = new Todo({
      title,
      description,
      isFinished,
      author: user._id
    })

    await todo.save();

    res.json(todo.toJSON());

  } catch (error) {
    next(error);
  }
});

router.put('/', checkSession, async (req, res, next) => {
  const { title, description, isFinished } = req.body;

  if(!title) {
    return res.status(422).json({errors: { title: "can't be blank" }});
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401);
    }

    const todos = await Todo.find({ author: user._id });

    todos.map(async todo => {
      if (todo.title === title) {
        if (typeof description !== undefined) {
          todo.description = description;
        }
    
        if (typeof isFinished !== undefined) {
          todo.isFinished = isFinished;
        }

        await todo.save(); // return in res updated todo's
      }
    });

    return res.json();
  } catch (error) {
    next(error);
  }
})

module.exports = router;