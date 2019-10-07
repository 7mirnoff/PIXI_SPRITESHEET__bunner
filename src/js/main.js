'use strict'

window.onload = function () {
  let planeJson
  let coinJson
  let animationPlane
  let animationCoin

  const scene = document.querySelector(`.scene`)

  function getFile(fileName, is) {
    var request = new XMLHttpRequest()
    request.open('GET', fileName)
    request.onloadend = function () {
      if (is) {
        planeJson = parse(request.responseText)
      } else {
        coinJson = parse(request.responseText)
      }
    }

    request.send()
  }

  getFile('assets/spritesheet.json', true)
  getFile('assets/spritesheetcoin.json', false)

  function parse(obj) {
    return JSON.parse(obj);
  }

  const loadSpritesheets = () => {
    const loader = PIXI.Loader.shared

    // Добавление текстур в лоадер
    loader.add(`plane`, `./assets/spritesheet.png`)
    loader.add(`coin`, `./assets/spritesheetcoin.png`)

    // Начать загрузку и ждать пока все не загрузится
    return new Promise((resolve) => {
      loader.load((loader, resources) => {
        const base_texture = resources[`plane`].texture.baseTexture
        const base_texture_coin = resources[`coin`].texture.baseTexture
        const s = new PIXI.Spritesheet(base_texture, planeJson)
        const scoin = new PIXI.Spritesheet(base_texture_coin, coinJson)

        s.parse(() => {})
        scoin.parse(() => {})

        const txs = []
        Object.keys(s.textures).sort().forEach(key => {
          txs.push(s.textures[key])
        })

        const txscoin = []
        Object.keys(scoin.textures).sort().forEach(key => {
          txscoin.push(scoin.textures[key])
        })

        animationPlane = new PIXI.AnimatedSprite(txs)

        animationCoin = new PIXI.AnimatedSprite(txscoin)

        render()

        resolve()
      })
    })
  }

  loadSpritesheets()

  const render = () => {
    let app = new PIXI.Application({
      transparent: true
    })
    scene.appendChild(app.view)

    const setSizeScene = () => {

      const canvasAspect = 1.28

      const wc = app.renderer.width
      const hc = app.renderer.height

      const wb = scene.offsetWidth
      const hb = scene.offsetHeight

      const sceneAspect = wb / hb

      let w
      let h

      if (canvasAspect > sceneAspect) {
        w = wb
        h = w / canvasAspect
      } else {
        h = hb
        w = h * canvasAspect
      }

      app.renderer.resize(w, h)

      animationPlane.width = w
      animationPlane.height = h

      animationCoin.width = w
      animationCoin.height = h
    }

    setSizeScene()

    window.addEventListener(`resize`, () => {
      setSizeScene()
    })

    app.stage.addChild(animationPlane)
    animationPlane.animationSpeed = 0.4
    animationPlane.loop = false
    animationPlane.play()

    let countLoop = 0

    app.stage.addChild(animationCoin)
    animationCoin.animationSpeed = 0.4
    animationCoin.loop = true
    animationCoin.onLoop = () => {
      animationCoin.stop()
      countLoop++
      if (countLoop <= 1) {
        setTimeout(() => {
          animationCoin.play()
        }, 1000)
      }
    }
    animationCoin.play()
    const duration = 500
    const easing = `easeInOutSine`

    const doLoop = () => {
      var tl = anime.timeline({
        loop: false
      })

      tl.add({
        targets: `.stage-1`,
        opacity: [0, 1],
        duration,
        easing
      }).add({
        targets: `.title-text__text--rus`,
        opacity: [1, 0],
        duration,
        easing,
        delay: 1500
      }).add({
        targets: `.title-text__text--ch`,
        opacity: [0, 1],
        duration,
        easing
      }).add({
        targets: `.stage-1`,
        opacity: [1, 0],
        duration,
        easing,
        delay: 1900
      }).add({
        targets: `.stage-2`,
        opacity: [0, 1],
        duration,
        easing
      }).add({
        targets: `.stage-2`,
        opacity: [1, 0],
        duration: 700,
        delay: 2100,
        easing,
        complete: function (anim) {
          doLoop()
          countLoop = 0
          animationPlane.gotoAndPlay(0)
          animationCoin.gotoAndPlay(0)
        }
      })
    }

    doLoop()
  }
}

// window.onload = function () {


// function setup() {
//   let sheet = PIXI.Loader.shared.resources[`assets/spritesheet.json`].spritesheet;
// }

// PIXI конец

// var tl = anime.timeline()
