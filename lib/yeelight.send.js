var Yeelight = require('./Yeelight.js');
var shared = require('./yeelight.shared.js');
var Promise = require('bluebird');

module.exports = function send(params) {
    if (!shared.instances[params.id]) {
        return Promise.reject(new Error("Yeelight: Bulb device " + params.id + " doesn't exist."));
    }
    
    if (params.method != 'connect' && params.method != 'disconnect' && params.method != 'send' && params.method != 'handleResponse')
    {
        shared.instances[params.id].connect();
        
        shared.instances[params.id].on('error', (error) => {                                        
            //return Promise.reject(new Error(error));
            console.error(error);
            return Promise.reject();
        });
    
        shared.instances[params.id].on('data_received', (data) => {                                        
            //console.log('Yeelight: Received data ' + data.toString().trim() + ' from bulb ' + params.id);
        });
        
        shared.instances[params.id].on('connect', () => {
            //console.log('Yeelight: Connected to bulb ' + params.id);
            shared.instances[params.id][params.method](params.params);
        });

        shared.instances[params.id].on('data_sent', (command) => {                                        
            //console.log('Yeelight: Sent command ' + command.trim() + ' to bulb ' + params.id);
            shared.instances[params.id].disconnect();
        });
    
        shared.instances[params.id].on('disconnect', () => {                                        
            //console.log('Yeelight: Disconnected from bulb ' + params.id);
            return Promise.resolve();
        });
    }
};