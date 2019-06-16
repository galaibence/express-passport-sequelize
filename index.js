const crypto = require('crypto');
const express = require('express');
const session = require("express-session");
const jsend = require('jsend');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FileStore = require('session-file-store')(session);
const uuidv4 = require('uuid/v4');

const { User, Book, Institution } = require('./models'); 

const SESSION_SECRET = process.env.SESSION_SECRET || "secret3";
const HMAC_SECRET = process.env.HMAC_SECRET || "secret1";

const customCallback = (req, res, next) => {
  passport.authenticate('local', (err, user, _info) => {
    if (err) { return next(err); }
    if (!user) { return next(err); }
    req.login(user, (err) => {
      if (err) { return next(err); }
      return res.jsend.success(null);
    });
  })(req, res, next);
};

passport.use(new LocalStrategy(
  { "usernameField": 'email' },
  async (email, password, done) => {

    let pwdHmac = null;
    try {
      pwdHmac = crypto.createHmac('sha256', HMAC_SECRET).update(password).digest();
    } catch(e) {
      done(err);
    }

    try {
      user = await User.findOne({"where": {"email": email}});
    } catch (e) {
      return done(err);
    }
    if (user == null) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    if (user['dataValues'].password === pwdHmac.toString()) {
      return done(null, user);
    }
    
    return done(null, false, { message: 'Incorrect password.' });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {  
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

const app = express();
app.use(session({
  "secret": SESSION_SECRET,
  "resave": false,
  "saveUninitialized": true,
  "store": new FileStore(),
  "genid": (req) => uuidv4()
}));
app.use(jsend.middleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

const routes = require('./routes/index.js');

app.post('/users/signin', customCallback, routes.usersSigninFactory());

app.post('/users/create', routes.usersCreateFactory(Institution, User));

app.get('/books', customCallback, routes.booksFactory(Book));

app.listen(3000, () => console.log(`Open http://localhost:3000 to see a response.`));