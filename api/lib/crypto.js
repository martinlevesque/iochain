const crypto2 = require('crypto2');

class Crypto {
  static async encrypt(str) {
    return await crypto2.encrypt(str, process.env.SECRET);
  }

  static async decrypt(str) {
    return await crypto2.decrypt(str, process.env.SECRET);
  }
}

module.exports = Crypto;
