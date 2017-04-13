const { assert } = require('chai');
const ffs = require('../src');

describe('feathers-fs', () => {
  it('is CommonJS compatible', () => {
    assert(typeof require('../lib') === 'function');
  });

  it('basic functionality', () => {
    assert(typeof ffs === 'function', 'It worked');
    assert(typeof ffs({root: 'test'}) === 'object');
  });

  it('can write and read json', done => {
    const service = ffs({root: __dirname});
    const path = 'test.json';
    const data = { test: true };
    service.create({ path, data })
      .then(data => service.get(path))
      .then(data => {
        assert(data.test);
        done();
      });
  });

  it('returns an error for missing files', done => {
    const service = ffs({root: __dirname});
    const path = 'missing.json';

    service.get(path).catch(error => {
      assert(error);
      done();
    });
  });

  it('returns an error for malformed files', done => {
    const service = ffs({root: __dirname});
    const path = 'malformed.json';

    service.get(path).catch(error => {
      assert(error);
      done();
    });
  });
});
