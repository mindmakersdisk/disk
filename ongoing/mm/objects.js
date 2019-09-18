// init decorator

SpriteMorph.prototype.originalInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
  this.originalInit(globals);
};

// Cria novas categorias;

SpriteMorph.prototype.categories.push('MMBLEmBot')
SpriteMorph.prototype.categories.push('MMBLESphero')
SpriteMorph.prototype.categories.push('MMBLEBit')
SpriteMorph.prototype.categories.push('MMSalaIoT')
SpriteMorph.prototype.categories.push('Arduino')

// Da novas cores para as categorias;

SpriteMorph.prototype.blockColor.MMBLEmBot = new Color(100, 200, 100);
SpriteMorph.prototype.blockColor.MMBLESphero = new Color(100, 200, 200);
SpriteMorph.prototype.blockColor.MMBLEBit = new Color(200, 100, 100);
SpriteMorph.prototype.blockColor.MMSalaIoT = new Color(100, 100, 200);
SpriteMorph.prototype.blockColor.Arduino = new Color(0, 200, 200);


SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initMindMakersBlocks = function() {

  this.blocks.mBotUltraSonic = {
    type: 'reporter',
    category: 'MMBLEmBot',
    spec: 'mbot ultrasonic sensor'
  };

  this.blocks.mBotLightSensor = {
    type: 'reporter',
    category: 'MMBLEmBot',
    spec: 'mbot light sensor'
  };

  this.blocks.mBotLineFollower = {
    type: 'reporter',
    category: 'MMBLEmBot',
    spec: 'mbot line follower'
  };


  this.blocks.mBotRun = {
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot move motor Left: %mbot1 Right: %mbot1', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: [125, 125]
  };

  this.blocks.mBotStop = {
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot stop'
  };

  this.blocks.mBotMotor = {
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot set motor %mbot2 to %mbot1', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: [
      ['Both'], 125
    ]
  };

  this.blocks.mBotTurn = {
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot motors turn %mbot9 speed %mbot1', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: [
      ['Clockwise'], 125
    ]
  };

  this.blocks.mBotServo = { //Unico que não esta funcionando ainda.
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot set servo Port: %mbot3 Slot: %mbot4 Angle: %mbot5', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: ['1', '1', 100]
  };

  this.blocks.mBotLed = {
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot set LED %mbot6 R: %n G: %n B: %n', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: [
      ['Both'], 255, 255, 255
    ]
  };

  this.blocks.mBotBuzzer = {
    type: 'command',
    category: 'MMBLEmBot',
    spec: 'mBot play tone on Note: %mbot7 Beat: %mbot8', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: ['B4', '1/4']
  };

  this.blocks.ArduinoLED = {
    type: 'command',
    category: 'Arduino',
    spec: 'Arduino %s comando: %arduino1', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: ['led', ['on']]
  };

  this.blocks.ArduinoServo = {
    type: 'command',
    category: 'Arduino',
    spec: 'Arduino %s comando: %arduino2', // valor %mbot1 fica definido como um "case" em 876 blocks.js
    defaults: ['servo', 'min']
  };


}

SpriteMorph.prototype.initBlocks = function() {
  this.originalInitBlocks();
  this.initMindMakersBlocks();
};

SpriteMorph.prototype.initBlocks();

// blockTemplates decorator

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;
SpriteMorph.prototype.blockTemplates = function(category) {
  var myself = this,
    blocks = myself.originalBlockTemplates(category);
  //console.log('this' + myself);

  //  Button that triggers a connection attempt
  this.mBotConnectButton = new PushButtonMorph(
    null,
    function() {
      this.statusConnectionmBot('8081');
    },
    'Connect mBot'
  );

  //  Button that triggers a disconnection from board

  this.mBotDisconnectButton = new PushButtonMorph(
    null,
    function() {
      this.registraDesconexaoMBOT();
    },
    'Disconnect mBot'
  );

  this.ArduinoConnectButton = new PushButtonMorph(
    null,
    function() {
      this.statusConnectionArduino('8085');
    },
    'Connect Arduino'
  );

  //  Button that triggers a disconnection from board

  this.ArduinoDisconnectButton = new PushButtonMorph(
    null,
    function() {
      this.registraDesconexaoArduino();
    },
    'Disconnect Arduino'
  );


  function blockBySelector(selector) {
    if (StageMorph.prototype.hiddenPrimitives[selector]) {
      return null;
    }
    var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
    newBlock.isTemplate = true;
    return newBlock;
  };

  if (category === 'MMBLEmBot') {

    blocks.push(this.mBotConnectButton);
    blocks.push(this.mBotDisconnectButton);
    blocks.push('-');

    //blocks.push(watcherToggle('mBotUltraSonic'));
    blocks.push(blockBySelector('mBotUltraSonic'));

    //blocks.push(watcherToggle('mBotLightSensor'));
    blocks.push(blockBySelector('mBotLightSensor'));

    //blocks.push(watcherToggle('mBotLineFollower'));
    blocks.push(blockBySelector('mBotLineFollower'));
    blocks.push('-');

    blocks.push(blockBySelector('mBotStop'));
    blocks.push(blockBySelector('mBotRun'));
    blocks.push(blockBySelector('mBotMotor'));
    blocks.push(blockBySelector('mBotTurn'));
    blocks.push('-');

    blocks.push(blockBySelector('mBotServo'));
    blocks.push(blockBySelector('mBotLed'));
    blocks.push(blockBySelector('mBotBuzzer'));

  }

  if (category === 'Arduino') {

    blocks.push(this.ArduinoConnectButton);
    blocks.push(this.ArduinoDisconnectButton);
    blocks.push('-');

    blocks.push(blockBySelector('ArduinoLED'));
    blocks.push(blockBySelector('ArduinoServo'));



  }


  return blocks;
};


/*
//---------------------------------------------------------------
//--------------Definição das funções dos blocos-----------------
//---------------------------------------------------------------
*/

//Sensores mBot
SpriteMorph.prototype.mBotUltraSonic = function() {
  if (clienteConectadoMBOT == false) {
    alert("mBot not connected");
  } else {

    return ultrasound
  }
};

SpriteMorph.prototype.mBotLightSensor = function() {
  if (clienteConectadoMBOT == false) {
    alert("mBot not connected");
  } else {

    return light
  }
};

SpriteMorph.prototype.mBotLineFollower = function() {
  if (clienteConectadoMBOT == false) {
    alert("mBot not connected");
  } else {

    return line
  }
}

//Atuadores mBot
SpriteMorph.prototype.mBotRun = function(speed1, speed2) {

  if (!lastmsg1) {
    var lastmsg1 = -1
  }
  if (!lastmsg2) {
    var lastmsg2 = -1
  }

  if (speed1 != lastmsg1) { //tentativa de tratar mensagens duplicadas
    lastmsg1 = speed1;

    if (speed1 > 255) { //validação de speed máxima
      speed1 = 255;
    } else if (speed1 < -255) {
      speed1 = -255;
    }

    if (speed1 >= 0) {

      let comando = DCMOTORM1;
      let valor = DCMOTOR_FORWARD + ',' + speed1;
      sendMessagemBot(comando, valor); //manda o valor
    } else {
      speed1 = -speed1;

      let comando = DCMOTORM1;
      let valor = DCMOTOR_BACK + ',' + speed1;
      sendMessagemBot(comando, valor); //manda o valor
    }
  }

  if (speed2 != lastmsg2) { //tentativa de tratar mensagens duplicadas
    lastmsg2 = speed2;

    if (speed2 > 255) { //validação de speed máxima
      speed2 = 255;
    } else if (speed2 < -255) {
      speed2 = -255;
    }

    if (speed2 >= 0) {

      let comando = DCMOTORM2;
      let valor = DCMOTOR_FORWARD + ',' + speed2;
      sendMessagemBot(comando, valor); //manda o valor
    } else {
      speed2 = -speed2;

      let comando = DCMOTORM2;
      let valor = DCMOTOR_BACK + ',' + speed2;
      sendMessagemBot(comando, valor); //manda o valor
    }
  }

};

SpriteMorph.prototype.mBotTurn = function(direction, speed) {

  if (speed > 255) {
    speed = 255;
  }
  if (speed < -255) {
    speed = -255;
  }

  if (direction == "Clockwise") {

    if (speed >= 0) {

      let comando = DCMOTORS_RIGHT;
      let valor = speed + ",0,0";
      sendMessagemBot(comando, valor); //manda o valor

    } else {
      speed = -speed;

      let comando = DCMOTORS_LEFT;
      let valor = speed + ",0,0";
      sendMessagemBot(comando, valor); //manda o valor

    }

  } else {

    if (speed >= 0) {

      let comando = DCMOTORS_LEFT;
      let valor = speed + ",0,0";
      sendMessagemBot(comando, valor); //manda o valor

    } else {
      speed = -speed;

      let comando = DCMOTORS_RIGHT;
      let valor = speed + ",0,0";
      sendMessagemBot(comando, valor); //manda o valor

    }

  }


};

SpriteMorph.prototype.mBotStop = function() {

  let comando = DCMOTORS;
  let valor = "0,0,0";
  sendMessagemBot(comando, valor); //manda o valor

};

SpriteMorph.prototype.mBotMotor = function(motor, speed) {

  if (speed > 255) {
    speed = 255;
  }
  if (speed < -255) {
    speed = -255;
  }

  if (motor == "M1") {

    if (speed >= 0) {

      let comando = DCMOTORM1;
      let valor = DCMOTOR_FORWARD + ',' + speed;
      sendMessagemBot(comando, valor); //manda o valor

    } else {
      speed = -speed;

      let comando = DCMOTORM1;
      let valor = DCMOTOR_BACK + ',' + speed;
      sendMessagemBot(comando, valor); //manda o valor

    }

  } else if (motor == "M2") {

    if (speed >= 0) {

      let comando = DCMOTORM2;
      let valor = DCMOTOR_FORWARD + ',' + speed;
      sendMessagemBot(comando, valor); //manda o valor

    } else {
      speed = -speed;

      let comando = DCMOTORM2;
      let valor = DCMOTOR_BACK + ',' + speed;
      sendMessagemBot(comando, valor); //manda o valor

    }

  } else {
    //Ambos or Both
    if (speed >= 0) { //validação de frente ou ré

      let comando = DCMOTORS;
      let valor = speed + ",0,0";
      sendMessagemBot(comando, valor); //manda o valor

    } else {
      speed = -speed;

      let comando = DCMOTORS_BACK;
      let valor = speed + ",0,0";
      sendMessagemBot(comando, valor);

    }

  }
};

SpriteMorph.prototype.mBotServo = function(connector, slot, angle) {

  var now = +new Date();
  if (now - lastmsg > 1000) { // 1 s
    lastmsg = now;
    if (angle > 150) {
      angle = 150;
    }

    let comando = SERVOMOTOR;
    let valor = connector + ',' + slot + ',' + angle;
    sendMessagemBot(comando, valor); //manda o valor

  }
}

SpriteMorph.prototype.mBotLed = function(index, red, green, blue) {

  var now = +new Date();
  if (now - lastmsg > 1000) { // 1s
    lastmsg = now;
    if (red > 255) {
      red = 255;
    }
    if (green > 255) {
      green = 255;
    }
    if (blue > 255) {
      blue = 255;
    }

    if (index == "1") {

      let comando = LEDLEFT;
      let valor = red + "," + green + "," + blue;
      sendMessagemBot(comando, valor);

    } else if (index == "2") {

      let comando = LEDRIGHT;
      let valor = red + "," + green + "," + blue;
      sendMessagemBot(comando, valor);

    } else {

      let comando = LEDBOTH;
      let valor = red + "," + green + "," + blue;
      sendMessagemBot(comando, valor);

    }

  }

}

SpriteMorph.prototype.mBotBuzzer = function(tone, beat) {

  var now = +new Date();
  if (now - lastmsg > 500) { // 500ms
    lastmsg = now;

    let comando = PLAYNOTE;
    let valor = tone + ',' + beat;
    sendMessagemBot(comando, valor);

  } else {

    console.log('too fast');

  }

}

SpriteMorph.prototype.ArduinoLED = function(comando, valor) {
  comando = comando.toLowerCase() + '';
  valor = valor + '';
  sendMessageArduino(comando, valor);

}

SpriteMorph.prototype.ArduinoServo = function(comando, valor) {
  comando = comando.toLowerCase() + '';
  valor = valor + '';
  sendMessageArduino(comando, valor);

}
