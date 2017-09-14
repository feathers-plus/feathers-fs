// const makeDebug = require('debug');
// const debug = makeDebug('feathers-fs');
const p = require('path');
const fs = require('fs');

const defaults = {
  root: undefined,
  cache: false,
  type: 'json'
};

class Service {
  constructor (options) {
    if (!options.root) {
      throw new Error('You must provide a `root` path to the feathers-json adapter');
    }
    this.options = Object.assign({}, defaults, options);
  }

  create ({path, data}) {
    if (!path) {
      return Promise.reject(new Error('You must pass a `path` to the feathers-json adapter\'s create method.'));
    }

    let filePath = this.makeFilePath(path);
    return this.toFileString(data)
      .then(dataString => {
        return new Promise((resolve, reject) => {
          fs.writeFile(filePath, dataString, 'utf8', function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      });
  }

  get (path) {
    if (!path) {
      return Promise.reject(new Error('You must pass a `path` to the feathers-json adapter\'s get method.'));
    }
    path = this.makeFilePath(path);

    return this.readFromFile(path);
  }

  /**
   * Reads a file at `path` and returns a Promise that resolves with an object literal.
   * @param {String} path - The location of the file to be read.
   * @return Promise
   */
  readFromFile (path) {
    return new Promise((resolve, reject) => {
      let data;
      try {
        const shouldCache = this.options.cache;

        shouldCache || this.clearCache(path);
        data = require(path);
        shouldCache || this.clearCache(path);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clears a module from the require cache.
   * @param {String} path - The module path to be cleared from the require cache
   */
  clearCache (path) {
    delete require.cache[require.resolve(path)];
  }

  // Input an object literal and output a string.
  toFileString (data) {
    return new Promise((resolve, reject) => {
      let formatted;
      try {
        formatted = JSON.stringify(data, null, 2);
        resolve(formatted);
      } catch (error) {
        reject(error);
      }
    });
  }

  makeFilePath (path) {
    let fullPath = p.join(this.options.root, path);
    let extension = '.' + this.options.type;
    if (!fullPath.includes(extension)) {
      fullPath += extension;
    }
    return fullPath;
  }
}

function init (options) {
  options = Object.assign({}, defaults, options);
  return new Service(options);
}

init.Service = Service;

module.exports = init;
