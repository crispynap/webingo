const _ = require('partial-js');

const strings = {
  livingCommuneNames: ['잘자리', '아랫집', '살림집', '사랑채', '마실집'],
  livingCommuneName() {
    return this.livingCommuneNames[_.random(0, this.livingCommuneNames.length)];
  }
}

module.exports = strings;