var net = require('net');

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
        
    this.socket = net.connect({host: this.data.location.host, port: this.data.location.port});
    
    this.socket.on('connect', () => {
        //console.log("Connected to Yeelight " + this.data.id + " at " + this.data.location.host + ":" + this.data.location.port);
        this.update_data();
    });
    
    this.socket.on('data', (response) => {
        this.handleResponse(response);
    });
};

Yeelight.prototype.handleResponse = function(response) {
    //console.log("Received data from bulb " + this.data.id + ": " + response);
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
    
    return response;
};

Yeelight.prototype.disconnect = function() {
    this.socket.destroy();
};

Yeelight.prototype.send = function(params) {
        
    // Check for device compatibility with the method called
    //if (this.data.support.indexOf(params.method) < -1) { throw new Error(params.method + " is not supported"); }
    
    parsed_params = JSON.stringify(params) + "\r\n";
    //console.log("Sending " + parsed_params.trim() + " to bulb " + this.data.id);
    this.socket.write(parsed_params);
    
};

Yeelight.prototype.get_prop = function(props_array) {
    
    var command = {
        id: this.data.id,
        method: 'get_prop',
        params: props_array
    };
    
    this.send(command);
    
};
                      
Yeelight.prototype.update_data = function() {
    this.get_prop(['power', 'bright', 'color_mode', 'ct', 'rgb', 'hue', 'sat', 'name']);
};



///////////////////
////// POWER //////
///////////////////

Yeelight.prototype.set_power = function(power, effect, duration) {
    
    effect = effect || undefined;
    duration = duration || undefined;

    var command = {
        id: this.data.id,
        method: 'set_power',
        params: [power, effect, duration]
    };
    
    this.data.power = power;
    this.send(command);
    
};

Yeelight.prototype.toggle = function() {
    
    var command = {
        id: this.data.id,
        method: 'toggle',
        params: []
    };
    
    this.data.power = this.data.power === 'on' ? 'off' : 'on';
    this.send(command);
    
};



//////////////////
////// FLOW //////
//////////////////

Yeelight.prototype.start_cf = function(count, action, flow_expression) {
    
    var command = {
        id: this.data.id,
        method: 'start_cf',
        params: [count, action, flow_expression]
    };
    
    this.send(command);
    
};

Yeelight.prototype.stop_cf = function() {
    
    var command = {
        id: this.data.id,
        method: 'stop_cf',
        params: []
    };
    
    this.send(command);
    
};



//////////////////
////// CRON //////
//////////////////

Yeelight.prototype.cron_add = function(type, value) {
    
    var command = {
        id: this.data.id,
        method: 'cron_add',
        params: [type, value]
    };
    
    this.send(command);
    
};

Yeelight.prototype.cron_get = function(type) {
    
    var command = {
        id: this.data.id,
        method: 'cron_get',
        params: [type]
    };
    
    this.send(command);
    
};

Yeelight.prototype.cron_del = function(type) {
    
    var command = {
        id: this.data.id,
        method: 'cron_del',
        params: [type]
    };
    
    this.send(command);
    
};



///////////////////////////////
////// COLOR & BIGHTNESS //////
///////////////////////////////


Yeelight.prototype.set_bright = function(brightness, effect, duration) {
    
    effect = effect || undefined;
    duration = duration || undefined;
        
    var command = {
        id: this.data.id,
        method: 'set_bright',
        params: [brightness, effect, duration]
    };
    
    this.data.bright = brightness;
    this.send(command);
    
};

Yeelight.prototype.set_ct_abx = function(ct_value, effect, duration) {
    
    effect = effect || undefined;
    duration = duration || undefined;
    
    var command = {
        id: this.data.id,
        method: 'set_ct_abx',
        params: [ct_value, effect, duration]
    };
    
    this.data.ct = ct_value;
    this.send(command);
    
};

Yeelight.prototype.set_hsv = function(hsv, effect, duration) {
    
    effect = effect || undefined;
    duration = duration || undefined;

    var hue = hsv.hue || this.data.hue;
    var sat = hsv.sat || this.data.sat;
        
    var command = {
        id: this.data.id,
        method: 'set_hsv',
        params: [hue, sat, effect, duration]
    };
    
    this.data.hue = hue;
    this.data.sat = sat;
    this.send(command);
    
};

Yeelight.prototype.set_rgb = function(rgb, effect, duration) {
    
    effect = effect || undefined;
    duration = duration || undefined;
    
    rgb = rgb[0] * 65536 + rgb[1] * 256 + rgb[2];

    var command = {
        id: this.data.id,
        method: 'set_rgb',
        params: [rgb, effect, duration]
    };
    
    this.data.rgb = rgb;    
    this.send(command);
    
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
    
    this.send(command);
    
};

Yeelight.prototype.set_name = function(name) {
        
    var command = {
        id: this.data.id,
        method: 'set_name',
        params: [name]
    };
    
    this.data.name = name;
    this.send(command);
    
};

Yeelight.prototype.set_scene = function(params_array) {

    var command = {
        id: this.data.id,
        method: 'set_scene',
        params: params_array
    };
    
    this.send(command);
    
};

Yeelight.prototype.set_adjust = function(action, prop) {

    var command = {
        id: this.data.id,
        method: 'set_adjust',
        params: [action, prop]
    };
    
    this.send(command);
    
};

Yeelight.prototype.set_music = function(action, host, port) {

    var command = {
        id: this.data.id,
        method: 'set_music',
        params: [action, host, port]
    };
    
    this.send(command);
    
};

module.exports = Yeelight;

