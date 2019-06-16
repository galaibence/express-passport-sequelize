const crypto = require('crypto');

const HMAC_SECRET = process.env.HMAC_SECRET || 'secret1';

const validateUserInput = (user) => {
  return user.password != undefined  && user.password != null && 
         user.name != undefined && user.name != null &&
         validateUserRole(user.role) && validateUserEmail(user.email);
};

const validateUserEmail = (email) => {
  return email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) != null;
};

const validateUserRole = (role) => {
  return (role === 'student' || role === 'academic' || role === 'administrator');
};

const extractEmailDomain = (email) => {
  const parts = email.split(/@|\./);
  return parts[parts.length -2];
};

const hmacDigest = (passwd) => crypto.createHmac('sha256', HMAC_SECRET).update(passwd).digest();

module.exports = {
  validateUserInput,
  extractEmailDomain,
  hmacDigest
}