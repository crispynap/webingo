const _ = require('partial-js');

const isExist = (name, exists) => _.find(exists, existName => existName == name);
const getFreeNames = (names, exists) => _.filter(names, name => !isExist(name, exists));
const getRandomName = names => names[_.random(0, names.length - 1)];

const strings = {
  livingCommuneNames: ['잘자리', '아랫집', '살림집', '사랑채', '마실집'],


  getLCommuneName(exists) {
    return _.go(
      getFreeNames(this.livingCommuneNames, exists),
      getRandomName
    );
  }
}

module.exports = strings;