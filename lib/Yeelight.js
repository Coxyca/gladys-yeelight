"use strict";

var net = require('net');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

class Yeelight extends EventEmitter
{
    constructor (host, id, model, fw_ver, support) {

        super();

        id = id || undefined;
        model = model || undefined;
        fw_ver = fw_ver || undefined;
        support = support || undefined;

        this.data = {
                    id: id,
                    model: model,
                    fw_ver: fw_ver,
                    support: support,
                    location: {
                        host: host.split(":")[0],
                        port: host.split(":")[1]
                            },

                    power: undefined,
                    bright: undefined,
                    color_mode: undefined,
                    ct: undefined,
                    rgb: undefined,
                    hue: undefined,
                    sat: undefined,
                    name: undefined,

                    connected: false
                    };
    }

    connect () 
    {
        this.socket = net.connect({host: this.data.location.host, port: this.data.location.port});
        this.socket.on('error', (error) => { this.emit('error', error); });
        this.socket.on('data', (data) => { this.emit('data_received', data); });
        this.socket.on('connect', () => { this.emit('connect'); });
        this.socket.on('timeout', () => { this.emit('timeout'); });
    }

    send (params) 
    {
        var parsed_params = JSON.stringify(params) + "\r\n";
        this.socket.write(parsed_params, () => { this.emit('data_sent', parsed_params); });
    }

    disconnect (delay) 
    {
        delay = delay || 2000; // Required to make sure the response was received first

        setTimeout(() => {
            this.emit('disconnect');
            this.removeAllListeners();
            this.socket.destroy();
        }, delay);
    }

    handleResponse (response) 
    {
        response = JSON.parse(JSON.stringify(response));

        if (response.method === 'get_prop') {
            this.data.power = response.result[0] || this.data.power;
            this.data.bright = response.result[1] || this.data.bright;
            this.data.color_mode = response.result[2] || this.data.color_mode;
            this.data.ct = response.result[3] || this.data.ct;
            this.data.rgb = response.result[4] || this.data.rgb;
            this.data.hue = response.result[5] || this.data.hue;
            this.data.sat = response.result[6] || this.data.sat;
            this.data.name = response.result[7] || this.data.name;
        }
    }

    get_prop (params)
    {
        var command = {
            id: this.data.id,
            method: 'get_prop',
            params: params
        };
        return this.send(command);
    }

    update_data ()
    {
        return this.get_prop(['power', 'bright', 'color_mode', 'ct', 'rgb', 'hue', 'sat', 'name']);
    }

    ///////////////////
    ////// POWER //////
    ///////////////////

    set_power (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_power',
            params: params
        };
        this.data.power = params[0];
        return this.send(command);
    }

    toggle ()
    {
        var command = {
            id: this.data.id,
            method: 'toggle',
            params: []
        };
        this.data.power = this.data.power === 'on' ? 'off' : 'on';
        return this.send(command);
    }

    //////////////////
    ////// FLOW //////
    //////////////////

    start_cf (params)
    {
        var command = {
            id: this.data.id,
            method: 'start_cf',
            params: params
        };
        return this.send(command);
    }

    stop_cf ()
    {
        var command = {
            id: this.data.id,
            method: 'stop_cf',
            params: []
        };
        return this.send(command);
    }

    //////////////////
    ////// CRON //////
    //////////////////

    cron_add (params) 
    {
        var command = {
            id: this.data.id,
            method: 'cron_add',
            params: params
        };
        return this.send(command);
    }

    cron_get (params)
    {
        var command = {
            id: this.data.id,
            method: 'cron_get',
            params: params
        };
        return this.send(command);
    }

    cron_del (params)
    {
        var command = {
            id: this.data.id,
            method: 'cron_del',
            params: params
        };
        return this.send(command);
    }

    ///////////////////////////////
    ////// COLOR & BIGHTNESS //////
    ///////////////////////////////


    set_bright (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_bright',
            params: params
        };
        this.data.bright = params[0];
        return this.send(command);
    }

    set_ct_abx (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_ct_abx',
            params: params
        };
        this.data.ct = params[0];
        return this.send(command);
    }

    set_hsv (params)
    {
        params[0] = params[0] || this.data.hue;
        params[1] = params[1] || this.data.sat;

        var command = {
            id: this.data.id,
            method: 'set_hsv',
            params: params
        };
        this.data.hue = params[0];
        this.data.sat = params[1];
        return this.send(command);
    }

    set_rgb (params)
    {
        params[0] = params[0][0] * 65536 + params[0][1] * 256 + params[0][2];

        var command = {
            id: this.data.id,
            method: 'set_rgb',
            params: params
        };
        this.data.rgb = params[0];    
        return this.send(command);
    }

    //////////////////
    ////// MISC //////
    //////////////////

    set_default ()
    {
        var command = {
            id: this.data.id,
            method: 'set_default',
            params: []
        };
        return this.send(command);
    }

    set_name (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_name',
            params: params
        };
        this.data.name = params[0];
        return this.send(command);
    }

    set_scene (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_scene',
            params: params
        };
        return this.send(command);
    }

    set_adjust (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_adjust',
            params: params
        };
        return this.send(command);
    }

    set_music (params)
    {
        var command = {
            id: this.data.id,
            method: 'set_music',
            params: params
        };
        return this.send(command);
    }
}

module.exports = Yeelight;