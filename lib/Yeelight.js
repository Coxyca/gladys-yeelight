var net = require('net');
var Promise = require('bluebird');

function Yeelight(host, id, model, fw_ver, support) {
    
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
                name: undefined                
                };
    
}

Yeelight.prototype.connect = function() {
    return new Promise((resolve, reject) => {
        
        this.socket = net.connect({host: this.data.location.host, port: this.data.location.port});
        
        this.socket.on('error', (err) => {
            reject(new Error(err));
        });

        this.socket.on('connect', () => {
            this.socket.on('data', (response) => {
                this.handleResponse(response);
            });
            
            console.log('Yeelight: Connected to ' + this.data.location.host + ':' + this.data.location.port);
            this.update_data();
            resolve();
        });
        
    });
};

Yeelight.prototype.handleResponse = function(response) {
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
};

Yeelight.prototype.disconnect = function() {
    return new Promise((resolve, reject) => {
        console.log('Yeelight: Disconnected from ' + this.data.location.host + ':' + this.data.location.port);
        this.socket.destroy();
        resolve();
    });
};

Yeelight.prototype.send = function(params) {
    return new Promise((resolve, reject) => {
        parsed_params = JSON.stringify(params) + "\r\n";

        this.socket.write(parsed_params, () => {
            console.log('Yeelight: Sent command to ' + this.data.location.host + ':' + this.data.location.port);
            resolve();
        });
    });
};

Yeelight.prototype.get_prop = function(params) {
    
    var command = {
        id: this.data.id,
        method: 'get_prop',
        params: params
    };
    
    return this.send(command);
    
};
                      
Yeelight.prototype.update_data = function() {
    return this.get_prop(['power', 'bright', 'color_mode', 'ct', 'rgb', 'hue', 'sat', 'name']);
};



///////////////////
////// POWER //////
///////////////////

Yeelight.prototype.set_power = function(params) {

    var command = {
        id: this.data.id,
        method: 'set_power',
        params: params
    };
    
    this.data.power = params[0];
    return this.send(command);
};

Yeelight.prototype.toggle = function() {
    
    var command = {
        id: this.data.id,
        method: 'toggle',
        params: []
    };
    
    this.data.power = this.data.power === 'on' ? 'off' : 'on';
    return this.send(command);
    
};



//////////////////
////// FLOW //////
//////////////////

Yeelight.prototype.start_cf = function(params) {
    
    var command = {
        id: this.data.id,
        method: 'start_cf',
        params: params
    };
    
    return this.send(command);
    
};

Yeelight.prototype.stop_cf = function() {
    
    var command = {
        id: this.data.id,
        method: 'stop_cf',
        params: []
    };
    
    return this.send(command);
    
};



//////////////////
////// CRON //////
//////////////////

Yeelight.prototype.cron_add = function(params) {
    
    var command = {
        id: this.data.id,
        method: 'cron_add',
        params: params
    };
    
    return this.send(command);
    
};

Yeelight.prototype.cron_get = function(params) {
    
    var command = {
        id: this.data.id,
        method: 'cron_get',
        params: params
    };
    
    return this.send(command);
    
};

Yeelight.prototype.cron_del = function(params) {
    
    var command = {
        id: this.data.id,
        method: 'cron_del',
        params: params
    };
    
    return this.send(command);
    
};



///////////////////////////////
////// COLOR & BIGHTNESS //////
///////////////////////////////


Yeelight.prototype.set_bright = function(params) {
        
    var command = {
        id: this.data.id,
        method: 'set_bright',
        params: params
    };
    
    this.data.bright = params[0];
    return this.send(command);
    
};

Yeelight.prototype.set_ct_abx = function(params) {
    
    var command = {
        id: this.data.id,
        method: 'set_ct_abx',
        params: params
    };
    
    this.data.ct = params[0];
    return this.send(command);
    
};

Yeelight.prototype.set_hsv = function(params) {

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
    
};

Yeelight.prototype.set_rgb = function(params) {
    
    params[0] = params[0][0] * 65536 + params[0][1] * 256 + params[0][2];

    var command = {
        id: this.data.id,
        method: 'set_rgb',
        params: params
    };
    
    this.data.rgb = params[0];    
    return this.send(command);
    
};



//////////////////
////// MISC //////
//////////////////

Yeelight.prototype.set_default = function() {
        
    var command = {
        id: this.data.id,
        method: 'set_default',
        params: []
    };
    
    return this.send(command);
    
};

Yeelight.prototype.set_name = function(params) {
        
    var command = {
        id: this.data.id,
        method: 'set_name',
        params: params
    };
    
    this.data.name = params[0];
    return this.send(command);
    
};

Yeelight.prototype.set_scene = function(params) {

    var command = {
        id: this.data.id,
        method: 'set_scene',
        params: params
    };
    
    // Since we don't know what was changed, we force the instance to update
    return this.send(command)
    .then(() => {
        this.update_data();
    });
    
};

Yeelight.prototype.set_adjust = function(params) {

    var command = {
        id: this.data.id,
        method: 'set_adjust',
        params: params
    };
    
    // Since we don't know what was changed, we force the instance to update
    return this.send(command)
    .then(() => {
        this.update_data();
    });
    
};

Yeelight.prototype.set_music = function(params) {

    var command = {
        id: this.data.id,
        method: 'set_music',
        params: params
    };
    
    return this.send(command);
    
};

module.exports = Yeelight;

