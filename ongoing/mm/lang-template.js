mmTempDict = {

    /* ============================================

    mm/lang-pt_BR.js

    Brazilian Portuguese translation for MindMakers


    ============================================
    */
       //mbot:

       //Frases spec: em mm/objects.js

    'mbot ultrasonic sensor':
        '',

    'mbot light sensor':
        '',

    'mbot line follower':
        '',

    'mBot move motor Left: %mbot1 Right: %mbot1':
        '',

    'mBot stop':
        '',

    'mBot set motor %mbot2 to %mbot1':
        '',

    'mBot motors turn %mbot9 speed %mbot1':
        '',

    'mBot set servo Port: %mbot3 Slot: %mbot4 Angle: %mbot5':
        '',

    'mBot set LED %mbot6 R: %n G: %n B: %n':
        '',

    'mBot play tone on Note: %mbot7 Beat: %mbot8':
        '',

    'connect to mBot':
        '',

    'disconnect mBot':
        '',

    'Connect mBot':
        '',

    'Disconnect mBot':
        '',


    //valores %mbot em mm/blocks.js

    'Clockwise':
        '',

    'Counter-Clockwise':
        '',

    'Half':
        '',

    'Quater':
        '',

    'Eighth':
        '',

    'Whole':
        '',

    'Double':
        '',

    'Both':
        '',

    '(0) stop':
        '',

    '(70) slow' :
        '',

    '(125) fast' :
        '',

    '(255) max' :
        '',

    '(-70) reverse slow' :
        '',

    '(-125) reverse fast' :
        '',

    '(-255) reverse max' :
        ''

};


// Add attributes to original SnapTranslator.dict.LANG
for (var attrname in mmTempDict) {
  SnapTranslator.dict.LANG[attrname] = mmTempDict[attrname];
}
