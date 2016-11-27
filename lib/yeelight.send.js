var Yeelight = require('./Yeelight.js');
var shared = require('./yeelight.shared.js');

module.exports = function send(params) {
    if (params.method != 'connect' && params.method != 'disconnect' && params.method != 'send' && params.method != 'handleResponse') {
        shared.instances[params.id][params.method](params.params);
    }
};