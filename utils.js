const chalk = require('chalk');
const { Color } = require('hypixel-api-reborn');
module.exports = {
  parseRank (rank, nickname, plusColor, prefixColor) {
    switch (rank) {
      case 'Default': {
        return chalk.whiteBright(nickname);
      }
      case 'MVP++': {
        return `${chalk.hex(prefixColor.toHex())('[MVP')}${chalk.hex(plusColor.toHex())('++')}${chalk.hex(prefixColor.toHex())('] ' + nickname)}`;//chalk.hex(prefixColor.toHex())(`[${rank}] ${nickname}`).replace(/\+/, chalk.hex(plusColor.toHex())('+'))
      }
      case 'MVP+':
      case 'VIP+':
        return `${chalk.hex(rank === 'MVP+' ? new Color('AQUA').toHex() : new Color('GREEN').toHex())(rank === 'MVP+' ? '[MVP' : '[VIP')}${rank === 'MVP+' ? chalk.hex(plusColor.toHex())('+') : chalk.hex(new Color('GOLD').toHex())('+')}${chalk.hex(rank === 'MVP+' ? new Color('AQUA').toHex() : new Color('GREEN').toHex())(rank === 'MVP+' ? '] ' + nickname : '] ' + nickname)}`;
      case 'MVP':
      case 'VIP':
        return `${chalk.hex(rank === 'MVP' ? new Color('AQUA').toHex() : new Color('GREEN').toHex())(rank === 'MVP' ? '[MVP' : '[VIP')}${chalk.hex(rank === 'MVP' ? new Color('AQUA').toHex() : new Color('GREEN').toHex())(rank === 'MVP' ? '] ' + nickname : '] ' + nickname)}`;
      case 'Helper': {
        return `${chalk.hex('5555FF')(`[${rank}] ${nickname}`)}`;
      }
      case 'Admin': {
        return `${chalk.hex('AA0000')(`[${rank}] ${nickname}`)}`;
      }
      case 'Moderator': {
        return `${chalk.hex('00AA00')(`[${rank}] ${nickname}`)}`;
      }
      case 'OWNER': {
        return `${chalk.hex('AA0000')(`[${rank}] ${nickname}`)}`;
      }
      default: {
        return `${chalk.whiteBright(`[${rank}] ${nickname}`)}`;
      }
    }
  },
  isKey (key) {
      if(typeof key !== 'string') return false;
      if(key.length < 36) return false;
      if(!key) return false;
      return true;
  }
};