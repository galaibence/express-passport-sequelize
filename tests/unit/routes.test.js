const { usersSigninFactory, usersCreateFactory, booksFactory } = require('../../routes');

const Book = {
  'findAll': (_where) => [{"dataValues": {"some": "data"}}]
};
const Institution = {
  'findOne': (_where) => ({ "id": 1 })
};
const User = {
  'create': (_) => ({"some": "data"})
}

const usersSignin = usersSigninFactory();
const usersCreate = usersCreateFactory(Institution, User);
const books = booksFactory(Book);

test('/users/signin returns error if not authenticated', async () => {

  const req = { 'isAuthenticated': () => false };
  const res = { 'jsend': { 'error': (jsn) => { jsn['status'] = 'error'; return jsn; } } };
  const ret = await usersSignin(req, res, {});

  expect(ret).toEqual({"status": "error", "message": "Invalid email / password provided.", "code": 403 });

});

test('/users/signin returns success if authenticated', async () => {

  const req = { 'isAuthenticated': () => true };
  const res = { 'jsend': { 'success': (d) => ({ 'status':'success', 'data': d}) } };
  const ret = await usersSignin(req, res, {});

  expect(ret).toEqual({"status": "success", 'data': null });

});

test('/books return list if authenticated', async () => {
  
  const req = { 'isAuthenticated': () => true, 'user': { 'dataValues': { 'institution_id': 1 } } };
  const res = { 'jsend': { 'success': (d) => ({ 'status':'success', 'data': d}) } };

  const ret = await books(req, res, {});

  expect(ret).toEqual({'status': 'success', 'data': [{'some': 'data'}]});
});

test('/books return empty list if there are no books', async () => {
  
  const req = { 'isAuthenticated': () => true, 'user': { 'dataValues': { 'institution_id': 1 } } };
  const res = { 'jsend': { 'success': (d) => ({ 'status':'success', 'data': d}) } };

  const ret = await booksFactory({'findAll': ()=>{throw 'err';}})(req, res, {});

  expect(ret).toEqual({'status': 'success', 'data': []});

  const ret2 = await booksFactory({ 'findAll': () => new Promise(r => r(null)) })(req, res, {});

  expect(ret2).toEqual({'status': 'success', 'data': []});

});


test('/users/create fails on invalid domain', async () => {
  const req = { 'body': {
    "name": "bence",
    "email": "bence2@notvalid.hu",
    "password": "mypassword",
    "role": "student",
  } };
  const res = { 'jsend': { 'fail': (d) => ({ 'status':'fail', 'data': d}) } };

  const ret = await usersCreateFactory({'findOne': ()=>{throw 'err';}})(req, res, {});

  expect(ret).toEqual({'status': 'fail', 'data': {'email': 'Email domain does not belong to any institutions'}});
});

test('/users/create fails on user creation exception', async () => {
  const req = { 'body': {
    "name": "bence",
    "email": "bence2@mta.hu",
    "password": "mypassword",
    "role": "student",
  } };
  const res = { 'jsend': { 'error': (jsn) =>  { jsn['status'] = 'error'; return jsn; } } };

  const ret = await usersCreateFactory(Institution, {'create': ()=>{throw 'err';}})(req, res, {});

  expect(ret).toEqual({'status': 'error', 'code': 500, 'message': 'Cannot create user'});
});