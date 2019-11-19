module.exports = {
  mongodbMemoryServerOptions: {
    instance: {
      dbName: "evnt"
    },
    binary: {
      version: "4.2.1",
      skipMD5: true
    },
    autoStart: false
  }
};
