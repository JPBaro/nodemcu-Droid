import { Platform } from '@ionic/angular';
import { Sensors, TYPE_SENSOR } from '@ionic-native/sensors/ngx';
import { Component, OnInit } from '@angular/core';
import anime from 'animejs/lib/anime.es.js';
import { map } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { CameraPreview } from '@ionic-native/camera-preview/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  // MESSAGE DETAILS IO
  message = '';
  messages = [];
  currentUser = '';


  // SVG FACE ELEMENTS
  eyeLsleep = 'M 19 99 Q 59 110 95 116 Q 148 114 176 103 Q 159 127 96 136 Q 47 128 21 102 Z';
  eyeRsleep = 'M 19 99 Q 59 110 95 116 Q 148 114 176 103 Q 159 127 96 136 Q 47 128 21 102 Z';
  pupSleep = 'M 93 120 A 14 10 0 1 1 119 120 Z';

  mouthNormal = 'M 149 250 Q 366 279 649 250 Q 383 408 149 252 Z';
  mouthLying = 'M 301 248 Q 375 235 455 252 Q 375 297 300 248 Z';

  pupilaLreg = 'M 93 120 A 35 27 0 1 1 119 120 Z';
  pupilaRreg = 'M 93 120 A 35 27 0 1 1 119 120 Z';


  eyeLwUp = 'M 38 100 Q 103 0 168 105 Q 168 105 168 105 Q 149 145 100 148 Q 49 137 38 104 Z';
  eyeRwUp = this.eyeLwUp;


  // SENSORS VARIABLES 

  // GRAVITY 
  sensorG: any;
  gVal: any;
  gValX = 0;
  gValY = 0;
  gValZ = 0;

  tempVal: any;

  // 
  // STATUS 
  awake = false;
  awakeAnime: any;

  // IO 
  mensaje: any;
  displaySms: any;

  // CAMERA 
  smallPreview: boolean;
  IMAGE_PATH: any;
  colorEffect = 'none';
  setZoom = 1;
  flashMode = 'off';
  isToBack = false;

  statusCamera = false;

  constructor(private sensors: Sensors, private platform: Platform, private socket: Socket, private cameraPreview: CameraPreview) {

    // this.socket = io('http://192.168.1.14:3000');

    platform.ready().then(() => {
      this.initSensor();

    });

  }

  ngOnInit() {

    this.cameraPreview.startCamera({ x: 80, y: 450, width: 150, height: 150, toBack: false, previewDrag: true, tapPhoto: false });
    this.socket.connect();

    this.socket.fromEvent('message').subscribe(message => {
      console.log(message);
      document.getElementById('innersms').innerHTML = `${message}`;
      this.messages.push(message);
    });

  }

  initSensor() {
    this.sensors.enableSensor(TYPE_SENSOR.ACCELEROMETER);
    this.activateR(TYPE_SENSOR.ACCELEROMETER);
  }

  activateR(sensActiv) {
    setInterval(() => {
      this.sensors.getState().then((values) => {
        this.gravityData(values);
      });
    }, 500);
  }

  gravityData(val) {

    this.gValX = val[0].toFixed(3);
    this.gValY = val[1].toFixed(3);
    this.gValZ = val[2].toFixed(3);

    this.checkAwake();
    this.eyePosition();

  }

  checkAwake() {

    if (this.gValZ > 8 && this.awake === true) {

      this.wakeUpExpression('.grid-eye .pEye', this.eyeLsleep, 100, 1);
      this.wakeUpExpression('.grid-eye .pPup', this.pupSleep, 100, 1);
      this.wakeUpExpression('.grid-mouth .p', this.mouthLying, 400, 0.5);
      this.awake = false;
      this.socket.emit('sms-domecu', 0);

    }

    if (this.gValZ < 8 && this.awake === false) {

      this.wakeUpExpression('.grid-eye .pEye', this.eyeLwUp, 100, 1);
      this.wakeUpExpression('.grid-eye .pPup', this.pupilaLreg, 100, 1);
      this.wakeUpExpression('.grid-mouth .p', this.mouthNormal, 400, 2);
      this.awake = true;
      this.socket.emit('sms-domecu', 1);

    }
  }

  wakeUpExpression(idTarget, valueP, nDel, scLY) {

    anime({
      targets: idTarget,
      d: [
        { value: valueP }
      ],
      duration: 300,
      autoplay: true,
      delay: nDel,
      easing: 'easeInCubic',
      loop: false
    });
  }

  eyePosition() {

    anime({
      targets: '.grid-eye',
      rotate: this.gValX * 5,
      easing: 'linear'
    });

  }

  touchFaceIn(ev) {

    anime({ targets: '.pPup', scale: 0.5, elastic: 100 });
    anime({ targets: '#eLp', skewY: '13deg', elastic: 100 });
    anime({ targets: '#eRp', skewY: '-13deg', elastic: 100 });
  }

  touchFaceOut(ev) {
    anime({ targets: '.pPup', scale: 1, elastic: 100 });
    anime({ targets: '#eLp', skewY: '0deg', elastic: 100 });
    anime({ targets: '#eRp', skewY: '0deg', elastic: 100 });

    if (this.statusCamera === false) {

      this.show();
      this.statusCamera = true;
    } else {

    }
    

  }

  touchFaceMove(ev) {

  }


  getMessage() {
    this.socket.fromEvent('message').subscribe(message => {

      if (message !== '') {
        console.log(message);
        document.getElementById('innersms').innerHTML = `${message}`;
        this.messages.push(message);
      }
    });
  }

  show() {
    this.cameraPreview.show();
  }


}
