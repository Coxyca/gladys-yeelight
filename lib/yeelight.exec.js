var Yeelight = require('./Yeelight.js');
var shared = require('./yeelight.shared.js');
var Promise = require('bluebird');

module.exports = function exec(params) {
    
    var value = params.state.value;
    
    shared.instances[params.deviceType.device].connect();
    
    shared.instances[params.deviceType.device].on('error', (error) => {                                        
        //return Promise.reject(new Error(error));
        console.error(error);
        return Promise.reject();
    });
    
    shared.instances[params.deviceType.device].on('data_received', (data) => {                                        
        //console.log('Yeelight: Received data ' + data.toString().trim() + ' from bulb ' + params.deviceType.device);
    });
    
    shared.instances[params.deviceType.device].on('connect', () => {
        //console.log('Yeelight: Connected to bulb ' + params.deviceType.device);
        
        switch (params.deviceType.type) {
            case 'binary':
                var cmd = value == 1 ? 'on' : 'off';
                shared.instances[params.deviceType.device].set_power([cmd]);
                break;
            case 'brightness':
                shared.instances[params.deviceType.device].set_bright([value]);
                break;
            case 'hue':
                shared.instances[params.deviceType.device].set_hsv([value]);
                break;
            case 'saturation':
                shared.instances[params.deviceType.device].set_hsv(['', value]);
                break;
        };
    });
                                                  
    shared.instances[params.deviceType.device].on('data_sent', (command) => {                                        
        //console.log('Yeelight: Sent command ' + command.trim() + ' to bulb ' + params.deviceType.device);
        shared.instances[params.deviceType.device].disconnect();
    });
    
    shared.instances[params.deviceType.device].on('disconnect', () => {                                        
        //console.log('Yeelight: Disconnected from bulb ' + params.deviceType.device);
        return Promise.resolve();
    });
};