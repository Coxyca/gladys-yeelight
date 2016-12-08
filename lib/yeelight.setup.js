var dgram = require('dgram');
var httpHeaders = require('http-headers');
var Promise = require('bluebird');
var init = require('./yeelight.init.js');

var ssdp_address = '239.255.255.250:1982';
var cast_msg = new Buffer(
	       "M-SEARCH * HTTP/1.1\r\n" +
           "MAN: \"ssdp:discover\"\r\n" +
           "ST: wifi_bulb\r\n"
           );

module.exports = function setup() {
        
        var socket = dgram.createSocket("udp4");
        var bulbs = {};

        socket.on('listening', function() {
            console.log('Yeelight: Searching for bulbs. Please wait...');
            console.log('Yeelight: Broadcasting socket to ' + ssdp_address + '...');
            socket.send(cast_msg, 0, cast_msg.length, ssdp_address.split(":")[1], ssdp_address.split(":")[0]);
        });

        socket.on('message', function(msg, info) {
            var data = httpHeaders(msg.toString());
            bulbs[data.headers.id] = data.headers;
            bulbs[data.headers.id].location = {
                host: data.headers.location.substr(11).split(":")[0],
                port: data.headers.location.substr(11).split(":")[1]
            };
        });

        socket.bind();
    
        return new Promise(function(resolve, reject) {

            setTimeout(function() {
                socket.close();
                console.log("Yeelight: " + Object.keys(bulbs).length + " bulbs found");

                return Promise.map(Object.keys(bulbs), function(id) {
                    return gladys.device.create({
                            device: {
                                name: bulbs[id].name || 'Yeelight',
                                protocol: 'wifi',
                                service: 'yeelight',
                                identifier: bulbs[id].location.host + ":" + bulbs[id].location.port
                            },
                            types: [
                                {
                                    name: 'Power',
                                    identifier: 'power',
                                    tag: 'Power',
                                    type: 'binary',
                                    sensor: false,
                                    min: 0,
                                    max: 1
                                },
                                {
                                    name: 'Brightness',
                                    identifier: 'brightness',
                                    tag: 'Brightness',
                                    type: 'brightness',
                                    sensor: false,
                                    min: 1,
                                    max: 100
                                },
                                {
                                    name: 'Hue',
                                    identifier: 'hue',
                                    tag: 'Hue',
                                    type: 'hue',
                                    sensor: false,
                                    min: 1,
                                    max: 359
                                },
                                {
                                    name: 'Saturation',
                                    identifier: 'saturation',
                                    tag: 'Saturation',
                                    type: 'saturation',
                                    sensor: false,
                                    min: 1,
                                    max: 100
                                },
                            ]
                    }).then(() => {
                        console.log("Yeelight: Added bulb " + id + " (" + bulbs[id].location.host + ") to devices list");
                    });
                }).then(() => {
                    init();
                    console.log("Yeelight: Setting is done. You can now control your bulbs through Gladys devices pannel");
                    resolve();
                });
            }, 10000);
            
        });
};