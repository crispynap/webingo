const _ = require('partial-js');

const strings = {
  livingCommuneNames: ['잘자리', '아랫집', '살림집', '사랑채', '마실집'],
  livingCommuneName(exists) {
    const freeNames =
      _.filter(this.livingCommuneNames, name =>
        !_.find(exists, existName => existName == name));
    return freeNames[_.random(0, freeNames.length - 1)];
  }
}

module.exports = strings;