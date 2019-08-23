const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const mongoose = require('mongoose');
require('dotenv').config()


const app = express();
const client = redis.createClient();

const redisStore = new RedisStore({ 
  host: 'localhost', 
  port: 6379, 
  client: client, 
  ttl: 60*60*60*10 
 });

app.use(cors());

app.use(session({
  name: process.env.SESS_NAME,
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESS_SECRET,
  store: redisStore
}))

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/*const riderectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/login');
  } else {
    next();
  }
}

const riderectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/home');
  } else {
    next();
  }
}

app.use((req,res,next) => {
  const { userId } = req.session;
  if(userId) {
    const user = users.find(user => user.id === userId);
    if (user) {
      res.locals.user = user;
    }
  }
  next();
})

app.get('/', (req, res) => {
  const { userId } = req.session; 

  res.send(`
    ${userId ? `
    <a href = '/home'>Home</a>
    <form method='post' action='/logout'>
      <button>Logout</button>
    </form>`:`
    <a href = '/login'>Login</a>
    <a href = '/register'>Register</a>`}
    `);
});

app.get('/home', riderectLogin, (req, res) => {
  const { user } = res.locals;
  res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
      <li>Name: ${user.name}</li>
      <li>Email: ${user.email}</li>
    </ul>
  `);
}); 

app.route('/login' )
  .get(riderectHome, (req, res) => {
    res.send(`
      <h1>Login</h1>
      <form method='post' action='/login'>
        <input type='email' name='email' placeholder='Email' require />
        <input type='password' name='password' placeholder='Password' require />
        <input type='submit' /> 
      </form>
      <a href='/register'>Register</a>
    `);
  })
  .post(riderectHome, (req, res) => {
    const { email, password } = req.body;
    
    if (email && password) {
      const user = users.find(user => user.email === email && user.password === password);
      if (user) {
        req.session.userId = user.id;
        return res.redirect('/home');
      }
    }

    res.redirect('/login');
  });

app.route('/register')
  .get(riderectHome, (req, res) => {
    res.send(`
    <h1>Registration</h1>
    <form method='post' action='/register'>
      <input name='name' placeholder='Name' require />
      <input type='email' name='email' placeholder='Email' require />
      <input type='password' name='password' placeholder='Password' require />
      <input type='submit' /> 
    </form>
    <a href='/login'>Login</a>
  `);
  })
  .post(riderectHome, (req, res) => {
    const { name, email, password } = req.body;

    if (name && email && password) {
      const exist = users.some(user => user.email === email);
      if (!exist) {  
        const user = {
          id: users.length + 1,
          name,
          email,
          password   
        }

        users.push(user);

        req.session.userId = user.id;

        return res.redirect('/home');
      }
    }

    res.redirect('/register');
  });

app.post('/logout', riderectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/home');
    }
  });
  res.clearCookie(process.env.SESS_NAME);
  res.redirect('/');
});*/

mongoose.connect('mongodb+srv://user:RXeTlRcbYt7CBxhs@cluster0-bipcn.mongodb.net/test?retryWrites=true&w=majority',  { useNewUrlParser: true });
//mongoose.set('debug', true);


require('./models/User');

app.use(require('./routes'));

/*app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err.stack);
  res.json({'errors': {
    message: err.message,
    error: err
  }});
});

app.listen(process.env.PORT, () => console.log(`Server started at port ${process.env.PORT}`));