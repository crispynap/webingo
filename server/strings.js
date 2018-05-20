const _ = require('partial-js');

const isExist = (name, exists) => _.find(exists, existName => existName == name);
const getFreeNames = (names, exists) => _.filter(names, name => !isExist(name, exists));
const getRandomName = names => names[_.random(0, names.length - 1)];

const strings = {
  communeNames: ['잘자리', '아랫집', '살림집', '사랑채', '마실집'],

  getCommuneName(exists) {
    return _.go(
      getFreeNames(this.communeNames, exists),
      getRandomName
    );
  }
}

module.exports = strings;