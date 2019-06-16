const { validateUserInput,  extractEmailDomain, hmacDigest } = require('../../routes/util');

test('extractEmailDomain takes domain out of the address', () => {
  expect(extractEmailDomain('funky@email.com')).toBe('email');
});

test('validateUserInput fails if password is missing', () => {
  expect(validateUserInput({
    'name': 'a_name',
    'email': 'an@email.com',
    'role': 'administrator'
  })).toBe(false);

  expect(validateUserInput({
    'name': 'a_name',
    'password': null,
    'email': 'an@email.com',
    'role': 'administrator'
  })).toBe(false);
});

test('validateUserInput fails if name is missing or null', () => {
  expect(validateUserInput({
    'password': 'pwd',
    'email': 'an@email.com',
    'role': 'administrator'
  })).toBe(false);

  expect(validateUserInput({
    'name': null,
    'password': 'pwd',
    'email': 'an@email.com',
    'role': 'administrator'
  })).toBe(false);
});

test('validateUserInput fails if email format is incorrect', () => {
  expect(validateUserInput({
    'name': 'a_name',
    'password': 'pwd',
    'email': 'an.email.com',
    'role': 'administrator'
  })).toBe(false);

  expect(validateUserInput({
    'name': 'a_name',
    'password': 'pwd',
    'email': 'an@email',
    'role': 'administrator'
  })).toBe(false);

  expect(validateUserInput({
    'name': 'a_name',
    'password': 'pwd',
    'email': 'an.email@com',
    'role': 'administrator'
  })).toBe(false);
});

test('hmacDigest creates correct values', () => {
  expect(hmacDigest('abrakadabra')).toEqual(Buffer.from(
    [184, 244, 66, 27, 170, 43, 24, 78, 210, 152, 254, 205, 162, 39, 5, 
      139, 235, 38, 83, 100, 242, 254, 64, 15, 17, 135, 54, 18, 228, 227, 93, 174]));
});