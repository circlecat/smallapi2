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
  ttl: process.env.TWO_HOURS
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

mongoose.connect('mongodb+srv://user:RXeTlRcbYt7CBxhs@cluster0-bipcn.mongodb.net/test?retryWrites=true&w=majority',  
  { useNewUrlParser: true })
  .then(() => console.log('New connection to mongo'))
  .catch((err) => console.log('Smth went wrong', err));
//mongoose.set('debug', true);

//require('./models/User');

app.use(require('./routes'));

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err.stack);
  res.json({'errors': {
    message: err.message,
    error: err
  }});
});

app.listen(process.env.PORT, () => console.log(`Server started at port ${process.env.PORT}`));