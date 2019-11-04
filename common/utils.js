/**
 * Prints an arbitrary number of arguments.
 */
let log = (...args) => {
  let timestamp = "\x1b[32m[" + new Date().toUTCString() + "]\x1b[0m";
  // eslint-disable-next-line no-console
  console.log(timestamp, ...args);
};

let error = (...args) => {
  let timestamp = "\x1b[31m[" + new Date().toUTCString() + "]\x1b[0m";
  // eslint-disable-next-line no-console
  console.log(timestamp, ...args);
};

module.exports = {
  log,
  error
};
