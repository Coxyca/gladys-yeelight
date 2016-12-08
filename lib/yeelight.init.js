var shared = require('./yeelight.shared.js');
var Yeelight = require('./Yeelight.js');
var Promise = require('bluebird');

module.exports = function init() {
        
    return gladys.device.getByService({service: 'yeelight'})
    .then((devices) => {
        
        shared.instances = {};
        
        devices.forEach(function(device) {
            if (device.protocol == 'wifi') {
                var host = device.identifier.split(":")[0] + ":" + device.identifier.split(":")[1];        
                shared.instances[device.id] = new Yeelight(host, device.id);
            }
        });
                        
    });
    
};