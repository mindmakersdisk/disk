// labelPart() proxy

SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;
SyntaxElementMorph.prototype.labelPart = function(spec) {
    var part,
        block = this;

    switch (spec) {

        case '%mbot1':
            part = new InputSlotMorph(
                null,// text
                true, // numeric?
                {
                    ['(0) stop'] : '0',         //Internacionalização procura pelo ['(0) stop'] no lang-pt_BR e substitui
                    ['(70) slow'] : 70,
                    ['(125) fast'] : 125,
                    ['(255) max'] : 255,
                    ['(-70) reverse slow'] : -70,
                    ['(-125) reverse fast'] : -125,
                    ['(-255) reverse max'] : -255
                }
            );
            part.setContents(['(125) fast']);
            break;
        case '%mbot2':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                    'Both' : ['Both'],
                    'M1' : 'M1',
                    'M2' : 'M2'
                }
            );
            part.setContents(['Both']);
            break;
        case '%mbot3':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                    'Port1' : '1',
                    'Port2' : '2',
                    'Port3' : '3',
                    'Port4' : '4'

                }
            );
            part.setContents("1");
            break;
        case '%mbot4':
            part = new InputSlotMorph(
                null,// text
                true, // numeric?
                {
                    '1' : '1',
                    '2' : '2'
                }
            );
            part.setContents('1');
            break;
        case '%mbot5':
            part = new InputSlotMorph(
                null,// text
                true, // numeric?
                {
                    '0' : '0',
                    '45' : 45,
                    '90' : 90,
                    '135' : 135
                }
            );
            part.setContents('45');
            break;
        case '%mbot6':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                    'Both' : ['Both'],
                    '1' : '1',
                    '2' : '2'
                }
            );
            part.setContents(['Both']);
            break;
        case '%mbot7':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                  'C2': 'C2',
                  'D2': 'D2',
                  'E2': 'E2',
                  'F2': 'F2',
                  'G2': 'G2',
                  'A2': 'A2',
                  'B2': 'B2',
                  'C3': 'C3',
                  'D3': 'D3',
                  'E3': 'E3',
                  'F3': 'F3',
                  'G3': 'G3',
                  'A3': 'A3',
                  'B3': 'B3',
                  'C4': 'C4',
                  'D4': 'D4',
                  'E4': 'E4',
                  'F4': 'F4',
                  'G4': 'G4',
                  'A4': 'A4',
                  'B4': 'B4',
                  'C5': 'C5',
                  'D5': 'D5',
                  'E5': 'E5',
                  'F5': 'F5',
                  'G5': 'G5',
                  'A5': 'A5',
                  'B5': 'B5',
                  'C6': 'C6',
                  'D6': 'D6',
                  'E6': 'E6',
                  'F6': 'F6',
                  'G6': 'G6',
                  'A6': 'A6',
                  'B6': 'B6',
                  'C7': 'C7',
                  'D7': 'D7',
                  'E7': 'E7',
                  'F7': 'F7',
                  'G7': 'G7',
                  'A7': 'A7',
                  'B7': 'B7',
                  'C8': 'C8',
                  'D8': 'D8'
                  });
            part.setContents('B4');
            break;
        case '%mbot8':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                  'Half' : '1/2',
                  'Quater' : '1/4',
                  'Eighth' : '1/8',
                  'Whole' : '1',
                  'Double' : '2'
                });
            part.setContents(['Quater']);
            break;
        case '%mbot9':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                  'Clockwise' : ['Clockwise'],
                  'Counter-Clockwise' : ['Counter-Clockwise']
                });
            part.setContents(['Clockwise']);
            break;
        case '%arduino1':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                  'on' : ['on'],
                  'off' : ['off'],
                  'blink' : ['blink'],
                  'stop' : ['stop']
                });
            part.setContents(['on']);
            break;
        case '%arduino2':
            part = new InputSlotMorph(
                null,// text
                false, // numeric?
                {
                  'min' : 'min',
                  'max' : 'max',
                  'stop' : ['stop'],
                  'sweep' : 'sweep',
                  'angulo' : 90

                });
            part.setContents('min');
            break;





        default:
            part = this.originalLabelPart(spec);
    }
    return part;
};
