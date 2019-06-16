const { validateUserInput, extractEmailDomain, hmacDigest } = require('./util');

const usersSigninFactory = () => {
  const usersSignin = async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.jsend.error({ "message": "Invalid email / password provided.", "code": 403 })
    } else {
      return res.jsend.success(null);
    }
  };
  return usersSignin;
};

const usersCreateFactory = (Institution, User) => {
  const usersCreate = async (req, res, next) => {

    if (!validateUserInput(req.body)) {
      return res.jsend.fail({ "message": "Input is not valid", "data": req.body });
    }

    const user = req.body;
    const domain = extractEmailDomain(user.email);

    let institution = null;
    try {
      institution = await Institution.findOne({where: {"email_domain": domain}});
    } catch (e) {
      console.error(e);
      return res.jsend.fail({'email': 'Email domain does not belong to any institutions'});
    }
    if (institution == null) {
      return res.jsend.fail({'email': 'Email domain does not belong to any institutions'});
    }

    user['institution_id'] = institution.id;

    const pwdHmac = hmacDigest(user.password).toString();
    user['password'] = pwdHmac;

    let response = null;
    try {
      response = await User.create(user);
    } catch(e) {
      console.error(e);
      return res.jsend.error({ "message": "Cannot create user", "code": 500 });
    }

    return res.jsend.success(response);
  };

  return usersCreate;
};

const booksFactory = (Book) => {
  const books = async (req, res, _next) => {
    
    if (req.isAuthenticated()) {
      const user = req.user["dataValues"];

      let books = [];
      try {
        response = await Book.findAll({ "where": { "institution_id": user["institution_id"] } });
      } catch(e) {
        console.error('Cannot find books for institution ' +  user["institution_id"]);
        return res.jsend.success([]);
      }

      if (response != null) {
        books = response.map(r => r['dataValues']);
      }

      return res.jsend.success(books);
    }

    res.jsend.error({ "message": "Please log in first!", "code": 403 });
  };

  return books;
};

module.exports = {
  usersSigninFactory,
  usersCreateFactory,
  booksFactory
}