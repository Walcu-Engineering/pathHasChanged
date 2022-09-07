const pathHasChanged = require('./index.js'); 

const changed_customer = {
  name: 'Test name',
  surname: 'Test surname',
  theundefined: 'some value',
  contacts: [{
    name: 'Test contact 0 name',
    phones: ['Test contact 0 phone 0', 'Test contact 0 phone 1'],
    emails: ['Test contact 0 email 0', 'Test contact 0 email 1'],
  }, {
    name: 'Test contact 1 name',
    phones: ['Test contact 1 phone 0', 'Test contact 1 phone 1'],
    emails: ['Test contact 1 email 0', 'Test contact 1 email 1'],
  }],
};

const diffs = [
  {path: '/theundefined'}, //old value was not defined.
  {path: '/contacts/0', old_value: {name: 'old contact name', phones: ['old phone 1', 'old phone 2'], emails: ['old email 1', 'old email 2']}},
  {path: '/contacts/1/phones/1', old_value: 'contact 1 old phone 1'},
  {path: '/contacts/1/emails', old_value: ['contact 1 old email 0', 'Test contact 1 email 1']},
]

describe('pathHasChanged', () => {
  test('Simple top level path that has changed, should return true', () => {
    expect(pathHasChanged(changed_customer, diffs, '/theundefined')).toBe(true);
  });
  test('Check a deep path when there is a change for a deeper path. Should return true', () => {
    expect(pathHasChanged(changed_customer, diffs, '/contacts/1/phones')).toBe(true);
  });
  test('Check a deep path when there is a change for an ancestor path, and the value has changed. Should return true', () => {
    expect(pathHasChanged(changed_customer, diffs, '/contacts/1/emails/0')).toBe(true);
  });
  test('Check a deep path when there is a change for an ancestor path, but the value has not changed. Should return false', () => {
    expect(pathHasChanged(changed_customer, diffs, '/contacts/1/emails/1')).toBe(false);
  });
  test('Check a path that does not exist, should return false', () => {
    expect(pathHasChanged(changed_customer, diffs, '/this/path/does/not/exist')).toBe(false);
  });
});
