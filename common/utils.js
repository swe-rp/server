/**
 * Prints an arbitrary number of arguments.
 */
let log = (...args) => {
  let timestamp = "\x1b[32m[" + new Date().toUTCString() + "]\x1b[0m";
  console.log(timestamp, ...args);
};

module.exports = {
  log
};
