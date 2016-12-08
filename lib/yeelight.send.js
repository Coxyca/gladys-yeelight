var Yeelight = require('./Yeelight.js');
var shared = require('./yeelight.shared.js');
var Promise = require('bluebird');

module.exports = function send(params) {
    if (!shared.instances[params.id]) {
        return Promise.reject(new Error("Yeelight: Bulb device " + params.id + " doesn't exist."));
    }
    
    if (params.method != 'connect' && params.method != 'disconnect' && params.method != 'send' && params.method != 'handleResponse') {
        return shared.instances[params.id].connect()
        .then(() => {
            return shared.instances[params.id][params.method](params.params)
            .then(() => {
                return shared.instances[params.id].disconnect();
            });
        });
    }
};
