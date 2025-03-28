const pathHasChanged = require('./index.js'); 

const changed_customer = {
  name: 'Test name',
  surname: 'Test surname',
  theundefined: 'some value',
  nested: {
    nested: 'Hello',
    nested2: 'Bye2',
  },
  nested2: {
    nested: '2Bye',
    nested2: '2Hello2',
  },
  nested_array: [{
    nested_value: 'New value',
  }],
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
  {path: '/nested/nested2', old_value: 'Hello2'},
  {path: '/nested2', old_value: { nested: '2Hello', nested2: '2Hello2' }},
  {path: '/nested_array/0/nested_value', old_value: 'Old value'},
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
  test('Nested path has changed', () => {
    expect(pathHasChanged(changed_customer, diffs, '/nested')).toBe(true);
  });
  test('Nested.nested path has changed', () => {
    expect(pathHasChanged(changed_customer, diffs, '/nested/nested')).toBe(false);
  });
  test('Nested.nested2 path has not changed', () => {
    expect(pathHasChanged(changed_customer, diffs, '/nested/nested2')).toBe(true);
  });
  test('Nested2 path has changed', () => {
    expect(pathHasChanged(changed_customer, diffs, '/nested2')).toBe(true);
  });
  test('Nested.nested path has changed', () => {
    expect(pathHasChanged(changed_customer, diffs, '/nested2/nested')).toBe(true);
  });
  test('Nested.nested2 path has not changed', () => {
    expect(pathHasChanged(changed_customer, diffs, '/nested2/nested2')).toBe(false);
  });
  describe('Allow `-` to check every array subpath at once', () => {
    test('Some contact name has changed', () => {
      expect(pathHasChanged(changed_customer, diffs, '/contacts/-/name', {handle_array_paths: true})).toBe(true);
    });
    test('Some phone has changed', () => {
      expect(pathHasChanged(changed_customer, diffs, '/contacts/-/phones', {handle_array_paths: true})).toBe(true);
    });
    test('Some email has changed', () => {
      expect(pathHasChanged(changed_customer, diffs, '/contacts/-/emails', {handle_array_paths: true})).toBe(true);
    });
    test('Some email has changed generic', () => {
      expect(pathHasChanged(changed_customer, diffs, '/contacts/-/emails/-', {handle_array_paths: true})).toBe(true);
    });
    test('Some first email has changed', () => {
      expect(pathHasChanged(changed_customer, diffs, '/contacts/-/emails/0', {handle_array_paths: true})).toBe(true);
    });
    test('Some nested array value has changed', () => {
      expect(pathHasChanged(changed_customer, diffs, '/nested_array', {handle_array_paths: true})).toBe(true);
    });
    test('Some nested array value generic has changed', () => {
      expect(pathHasChanged(changed_customer, diffs, '/nested_array/-', {handle_array_paths: true})).toBe(true);
    });
  })
});
