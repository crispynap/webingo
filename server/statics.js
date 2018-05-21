const _ = require('partial-js');

const isExist = (name, exists) => _.find(exists, existName => existName == name);
const getFreeNames = (names, exists) => _.filter(names, name => !isExist(name, exists));
const getRandomName = names => names[_.random(0, names.length - 1)];
const getName = (list, exists) => getRandomName(getFreeNames(list, exists));

const strings = {
  communeNames: ['잘자리', '아랫집', '살림집', '사랑채', '마실집'],
  potraitNames: [
    '000.png', '001.png', '002.png', '003.png', '004.png', '005.png', '006.png', '007.png', '008.png', '009.png',
    '010.png', '011.png', '012.png', '013.png', '014.png', '015.png', '016.png', '017.png', '018.png', '019.png',
    '020.png', '021.png', '022.png', '023.png', '024.png', '025.png', '026.png', '027.png', '028.png', '029.png',
    '030.png', '031.png', '032.png', '033.png', '034.png', '035.png', '036.png', '037.png', '038.png', '039.png',
  ],

  getCommuneName(exists) {
    return getName(this.communeNames, exists);
  },

  getPotraitName(exists) {
    return getName(this.potraitNames, exists);
  }


}

module.exports = strings;