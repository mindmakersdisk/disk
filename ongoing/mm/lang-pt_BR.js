mmTempDict = {

    /* ============================================

    mm/lang-pt_BR.js

    Brazilian Portuguese translation for MindMakers


    ============================================
    */
       //mbot:

       //Frases spec: em mm/objects.js

    'mbot ultrasonic sensor':
        'mbot sensor ultrassom',

    'mbot light sensor':
        'mbot sensor de luz',

    'mbot line follower':
        'mbot segue-linha',

    'mBot move motor Left: %mbot1 Right: %mbot1':
        'mBot move motor Esq.: %mbot1 Dir.: %mbot1',

    'mBot stop':
        'mBot parar',

    'mBot set motor %mbot2 to %mbot1':
        'mBot motor %mbot2 para %mbot1',

    'mBot motors turn %mbot9 speed %mbot1':
        'mBot motores viram %mbot9 valocidade %mbot1',

    'mBot set servo Port: %mbot3 Slot: %mbot4 Angle: %mbot5':
        'mBot servo Porta: %mbot3 Slot: %mbot4 Angulo: %mbot5',

    'mBot set LED %mbot6 R: %n G: %n B: %n':
        'mBot LED %mbot6 R: %n G: %n B: %n',

    'mBot play tone on Note: %mbot7 Beat: %mbot8':
        'mBot toca na Nota: %mbot7 Compasso: %mbot8',

    'connect to mBot':
        'conectar ao mBot',

    'disconnect mBot':
        'desconectar mBot',

    'Connect mBot':
        'Conectar mBot',

    'Disconnect mBot':
        'Desconectar mBot',


    //valores %mbot em mm/blocks.js

    'Clockwise':
        'no sentido horário',

    'Counter-Clockwise':
        'no sentido anti-horário',

    'Half':
        'Metade',

    'Quater':
        'Quarta',

    'Eighth':
        'Oitava',

    'Whole':
        'Inteira',

    'Double':
        'Dupla',

    'Both':
        'Ambos',

    '(0) stop':
        '(0) parar',

    '(70) slow' :
        '(70) devagar',

    '(125) fast' :
        '(125) rápido',

    '(255) max' :
        '(255) máximo',

    '(-70) reverse slow' :
        '(-70) ré devagar',

    '(-125) reverse fast' :
        '(-125) ré rápido',

    '(-255) reverse max' :
        '(-255) ré máxímo',

    'on' :
        'ligado',

    'off' :
        'desligado',

    'blink' :
        'piscar',

    'stop' :
        'parar'



};

// Add attributes to original SnapTranslator.dict.pt
for (var attrname in mmTempDict) { SnapTranslator.dict.pt_BR[attrname] = mmTempDict[attrname]; }
