# feathers-fs

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-fs.svg?token=68efaaa07040350c25d5052543c380c869af4768d3710e956949702635eee8b3)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/feathers-fs.png?branch=master)](https://travis-ci.org/feathersjs/feathers-fs)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-fs/badges/gpa.svg)](https://codeclimate.com/github/feathersjs/feathers-fs)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-fs/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-fs/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-fs.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-fs)
[![Download Status](https://img.shields.io/npm/dm/feathers-fs.svg?style=flat-square)](https://www.npmjs.com/package/feathers-fs)

> Use the FeathersJS service interface to read and write data in the file system.

## Installation

```
npm install feathers-fs --save
```

## Documentation
The `feathers-js` module lets you use the FeathersJS service interface methods to read and write JSON-able data in the file system.  It creates `.json` files, by default, but is extendable to be able to read or write any text format that is serializable to/from JSON or a JavaScript object literal.  Here's a basic example:

```js
const ffs = require('feathers-fs');
const jsonService = app.use('/json', ffs({root: 'src/services'});

const messageData = { test: true };

jsonService.create({
  path: 'messages/messages.json',
  data: messageData
});
```

## API
### `service(options) -> FeathersService`
Sets up the plugin with the provided `options`.
  - `options {Object}` - must contain a `root` param.
    - `root {String}` *required* - the root path for all files that will be read or written.
    - `type {String}` - the file type/extension that this service will handle. *default:* `json`.  When creating a file, if a file extension is not provided, this will be appended.

## Service API

Two of the service methods are implemented:

### `create(data) -> Promise`
Creates a file using the provided data.
  - `data {Object}` - must contain `path` and `data` attributes.
    - `path {String}` *required* - the full path, including file name.  If an extension is not provided, the extension provided as `options.type` will automatically be appended.
    - `data {Object|Array}` *required* - The data to be written to the file.
The `create` method returns a promise that resolves to the `data` that was written to file.

### `get(path) -> Promise`
Reads a file from the provided path.
  - `path {String}` *required* - the full path, relative to the `options.root` of the file to be read.
The `get` method returns a promise that resolves to the data that was read from the file.

## Extending the Service
The service can be extended to handle file types other than `.json`.  When you create an instance of the service class, all attributes passed in the `options` will be available at `this.options`. Generally, both of the following methods will need to be overridden:

### `readFromFile(path) -> promise`
The `readFromFile` method is used to read the file at `path` and format it as an object literal.
  - `path {String}` - the full file path of the file to be read, including the `options.root`.
It must return a promise that resolves to an object literal.

### `toString(data) -> promise`
The `toString` method is used to convert the provided `data` into a string to be written to disk.
  - `data {Object}` - the object literal containing the data that will be formatted.
It must return a promise that resolves to a string.

### Example of Extending the Service

Here's a stubbed-out example of what extending a CSV service would look like.

```js
const BaseService = require('feathers-fs').Service;
const fs = require('fs');

class CsvService extends BaseService {
  readFromFile (path) {
    return new Promise((resolve, reject) => {
      // Use the path to read the file contents.
      fs.readFile(path, (error, data) => {
        if (err) {
          return reject(error)
        }
        // Use a node package to convert the data to an object literal.
        let formattingOptions = {
          fields: this.options.fields
        }
        let formatted = someCsvToJsonFunction(data, formattingOptions);
        resolve(formatted);
      });
    });
  }

  toString (data) {
    return new Promise((resolve, reject) => {
      // Use a node package to convert the data to a string.
      try {
        let formatted = someJsonToCsvFunction(data);
        return resolve(formatted);
      } catch (error) {
        return reject(error);
      }
    });
  }
}

const serviceOptions = {
  root: 'src/services',
  type: 'csv',
  // Some CSV plugins require an array of fields.
  // The fields are available inside the override methods as shown above.
  fields: ['first', 'second', 'third']
};
const csvService = app.use('/json', new CsvService(serviceOptions);

const tableData = {
  first: 'test1',
  second: 'test2',
  third: 'test3'
};

csvService.create({
  path: 'files/table-data.csv',
  data: tableData
});
```


## Complete Example

Here's an example of a Feathers server that uses `feathers-fs`. 

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const feathersFs = require('feathers-fs');

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Initialize your feathers plugin
  .use('/json', feathersFs({
    root: 'src',
    type: 'json' // the default value.
  }))
  .use(errorHandler());

const dataToStore = [
  {
    to: 'marshall',
    from: 'marshall',
    body: 'Stop talking to that rubber ducky!'
  }, {
    to: 'marshall',
    from: 'marshall',
    body: `...unless you're rubber duck debugging.`
  }
];

// Store the data at `/src/services/messages/messages.seed.json`
app.service('/json').create({
  path: '/services/messages/messages.seed.json', // path will be appended to the `root` path.
  data: dataToStore
})

// Retrieve the data at the provided path.
app.service('/json').get('/services/messages/messages.seed.json')
  .then(data => {
    assert.deepEqual(data, dataToStore) // --> true
  });

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
