module.exports = function(sails) {
    
    var setup = require('./lib/yeelight.setup.js');
    var init = require('./lib/yeelight.init.js');
    var exec = require('./lib/yeelight.exec.js');
    var send = require('./lib/yeelight.send.js');
    
    gladys.on('ready', function() {
        init();
    });
    
    return {
        setup,
        init,
        exec,
        send
    };
    
};