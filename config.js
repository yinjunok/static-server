const config = {
  "port": 4000,
  "root": "./static",
  "cache": {
    "file": /(jpg|jpeg|png|gif|css|js)/i,
    "maxAge": 60 * 60 * 24 * 365,
  },
};

module.exports = config;
