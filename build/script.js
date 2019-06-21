'use strict';

window.onload = function () {
  var planeJson = void 0;
  var coinJson = void 0;
  var animationPlane = void 0;
  var animationCoin = void 0;

  var scene = document.querySelector('.scene');

  function getFile(fileName, is) {
    var request = new XMLHttpRequest();
    request.open('GET', fileName);
    request.onloadend = function () {
      if (is) {
        planeJson = parse(request.responseText);
      } else {
        coinJson = parse(request.responseText);
      }
    };

    request.send();
  }

  getFile('assets/spritesheet.json', true);
  getFile('assets/spritesheetcoin.json', false);

  function parse(obj) {
    return JSON.parse(obj);
  }

  var loadSpritesheets = function loadSpritesheets() {
    var loader = PIXI.Loader.shared;

    // Добавление текстур в лоадер
    loader.add('plane', './assets/spritesheet.png');
    loader.add('coin', './assets/spritesheetcoin.png');

    // Начать загрузку и ждать пока все не загрузится
    return new Promise(function (resolve) {
      loader.load(function (loader, resources) {
        var base_texture = resources['plane'].texture.baseTexture;
        var base_texture_coin = resources['coin'].texture.baseTexture;
        var s = new PIXI.Spritesheet(base_texture, planeJson);
        var scoin = new PIXI.Spritesheet(base_texture_coin, coinJson);

        s.parse(function () {});
        scoin.parse(function () {});

        var txs = [];
        Object.keys(s.textures).sort().forEach(function (key) {
          txs.push(s.textures[key]);
        });

        var txscoin = [];
        Object.keys(scoin.textures).sort().forEach(function (key) {
          txscoin.push(scoin.textures[key]);
        });

        animationPlane = new PIXI.AnimatedSprite(txs);

        animationCoin = new PIXI.AnimatedSprite(txscoin);

        render();

        resolve();
      });
    });
  };

  loadSpritesheets();

  var render = function render() {
    var app = new PIXI.Application({
      transparent: true
    });
    scene.appendChild(app.view);

    var setSizeScene = function setSizeScene() {

      var canvasAspect = 1.28;

      var wc = app.renderer.width;
      var hc = app.renderer.height;

      var wb = scene.offsetWidth;
      var hb = scene.offsetHeight;

      var sceneAspect = wb / hb;

      var w = void 0;
      var h = void 0;

      if (canvasAspect > sceneAspect) {
        w = wb;
        h = w / canvasAspect;
      } else {
        h = hb;
        w = h * canvasAspect;
      }

      app.renderer.resize(w, h);

      animationPlane.width = w;
      animationPlane.height = h;

      animationCoin.width = w;
      animationCoin.height = h;
    };

    setSizeScene();

    window.addEventListener('resize', function () {
      setSizeScene();
    });

    app.stage.addChild(animationPlane);
    animationPlane.animationSpeed = 0.4;
    animationPlane.loop = false;
    animationPlane.play();

    var countLoop = 0;

    app.stage.addChild(animationCoin);
    animationCoin.animationSpeed = 0.4;
    animationCoin.loop = true;
    animationCoin.onLoop = function () {
      animationCoin.stop();
      countLoop++;
      if (countLoop <= 1) {
        setTimeout(function () {
          animationCoin.play();
        }, 1000);
      }
    };
    animationCoin.play();

    var doLoop = function doLoop() {
      var tl = anime.timeline({
        loop: false
      });

      tl.add({
        targets: '.stage-1',
        opacity: [0, 1],
        duration: 500,
        easing: 'easeInOutSine'
      }).add({
        targets: '.title-text__text--rus',
        opacity: [1, 0],
        duration: 500,
        easing: 'easeInOutSine',
        delay: 1500
      }).add({
        targets: '.title-text__text--ch',
        opacity: [0, 1],
        duration: 500,
        easing: 'easeInOutSine'
      }).add({
        targets: '.stage-1',
        opacity: [1, 0],
        duration: 500,
        easing: 'easeInOutSine',
        delay: 1900
      }).add({
        targets: '.stage-2',
        opacity: [0, 1],
        duration: 500,
        easing: 'easeInOutSine'
      }).add({
        targets: '.stage-2',
        opacity: [1, 0],
        duration: 700,
        delay: 2100,
        easing: 'easeInOutSine',
        complete: function complete(anim) {
          doLoop();
          countLoop = 0;
          animationPlane.gotoAndPlay(0);
          animationCoin.gotoAndPlay(0);
        }
      });
    };

    doLoop();
  };
};

// window.onload = function () {


// function setup() {
//   let sheet = PIXI.Loader.shared.resources[`assets/spritesheet.json`].spritesheet;
// }

// PIXI конец

// var tl = anime.timeline()