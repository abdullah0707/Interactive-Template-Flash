var canvas,
  stage,
  exportRoot,
  anim_container,
  dom_overlay_container,
  fnStartAnimation;

var soundsArr;
var clickSd;

var start = true,
  soundMuted = true;

var numOfAns = 3;

var l = console.log;

var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;
function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");
	var comp=AdobeAn.getComposition("428493DF19C8E5489A701F77EA77AA9C");
	var lib=comp.getLibrary();
	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", function(evt){handleFileLoad(evt,comp)});
	loader.addEventListener("complete", function(evt){handleComplete(evt,comp)});
	var lib=comp.getLibrary();
	loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
	var images=comp.getImages();	
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}
function handleComplete(evt,comp) {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib=comp.getLibrary();
	var ss=comp.getSpriteSheet();
	var queue = evt.target;
	var ssMetadata = lib.ssMetadata;
	for(i=0; i<ssMetadata.length; i++) {
		ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
	}
	exportRoot = new lib.screen4();
	stage = new lib.Stage(canvas);	
	//Registers the "tick" event listener.
	fnStartAnimation = function() {
		stage.addChild(exportRoot);
    stage.enableMouseOver(10);
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);
    prepareTheStage();
	}	    
	//Code to support hidpi screens and responsive scaling.
  function makeResponsive(isResp, respDim, isScale, scaleType) {
    var lastW,
      lastH,
      lastS = 1;
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function resizeCanvas() {
      var w = lib.properties.width,
        h = lib.properties.height;
      var iw = window.innerWidth,
        ih = window.innerHeight;
      var pRatio = window.devicePixelRatio || 1,
        xRatio = iw / w,
        yRatio = ih / h,
        sRatio = 1;
      if (isResp) {
        if (
          (respDim == "width" && lastW == iw) ||
          (respDim == "height" && lastH == ih)
        ) {
          sRatio = lastS;
        } else if (!isScale) {
          if (iw < w || ih < h) sRatio = Math.min(xRatio, yRatio);
        } else if (scaleType == 1) {
          sRatio = Math.min(xRatio, yRatio);
        } else if (scaleType == 2) {
          sRatio = Math.max(xRatio, yRatio);
        }
      }
      canvas.width = w * pRatio * sRatio;
      canvas.height = h * pRatio * sRatio;
      canvas.style.width =
        dom_overlay_container.style.width =
        anim_container.style.width =
        w * sRatio + "px";
      canvas.style.height =
        anim_container.style.height =
        dom_overlay_container.style.height =
        h * sRatio + "px";
      stage.scaleX = pRatio * sRatio;
      stage.scaleY = pRatio * sRatio;
      lastW = iw;
      lastH = ih;
      lastS = sRatio;
      stage.tickOnUpdate = false;
      stage.update();
      stage.tickOnUpdate = true;
      canvas.style.display = "block";
      anim_container.style.display = "block";
    }
  }
  makeResponsive(true, "both", true, 1);
  AdobeAn.compositionLoaded(lib.properties.id);
  fnStartAnimation();
}

function prepareTheStage() {
  exportRoot["soundBtn"].cursor = "pointer";

  clickSd = new Howl({
    src: ["sounds/click.mp3"],
  });

  quizSd1 = new Howl({
    src: ["sounds/quizSd1.mp3"],
  });

  quizSd = new Howl({
    src: ["sounds/quizSd.mp3"],
  });

  quizSd2 = new Howl({
    src: ["sounds/quizSd2.mp3"],
  });

  quizSd3 = new Howl({
    src: ["sounds/quizSd3.mp3"],
  });

  soundsArr = [clickSd, quizSd, quizSd1, quizSd2, quizSd3, ];
  stopAllSounds();

  for (var i = 1; i <= numOfAns; i++) {
    console.log(i);
    exportRoot["a" + i].id = i;
  }
  exportRoot["soundBtn"].addEventListener("click", function () {
    if (soundMuted) {
      exportRoot["soundBtn"].gotoAndStop(1);
      quizSd.play();
      quizSd.on("end", function () {
        exportRoot["soundBtn"].gotoAndStop(0);
        soundMuted = true;
      });
    } else {
      stopAllSounds();
      exportRoot["soundBtn"].gotoAndStop(0);
    }
    soundMuted = !soundMuted;
  });
  hideFB();
}

function hideFB() {
  for (var i = 1; i <= numOfAns; i++) {
    console.log(i);
    exportRoot["p" + i].alpha = 0;
    exportRoot["p" + i].playV = false;
  }
}

function stopAllSounds() {
  for (var s = 0; s < soundsArr.length; s++) {
    soundsArr[s].stop();
  }
}

function activateButtonsQuz() {
  exportRoot["soundBtn"].alpha = 1;
  for (var i = 1; i <= numOfAns; i++) {
    if (!start) {
      exportRoot["a" + i].gotoAndStop(0);
    }
    exportRoot["a" + i].cursor = "pointer";
    exportRoot["a" + i].addEventListener("click", chooseQuzFn);
    exportRoot["a" + i].addEventListener("mouseover", over_pic);
    exportRoot["a" + i].addEventListener("mouseout", out_pic);
  }
  start = false;
}

function deactivateButtons() {
  exportRoot["soundBtn"].alpha = 0;
  exportRoot["soundBtn"].gotoAndStop(0);
  soundMuted = true;
  for (var i = 1; i <= numOfAns; i++) {
    exportRoot["a" + i].cursor = "auto";
    exportRoot["a" + i].removeEventListener("click", chooseQuzFn);
    exportRoot["a" + i].removeEventListener("mouseover", over_pic);
    exportRoot["a" + i].removeEventListener("mouseout", out_pic);
  }
}

function chooseQuzFn(e2) {
  stopAllSounds();
  clickSd.play();
  deactivateButtons();
  console.log(e2.currentTarget.id);
  exportRoot["p" + e2.currentTarget.id].alpha = 1;
  exportRoot["p" + e2.currentTarget.id].playV = true;
  exportRoot["p" + e2.currentTarget.id].gotoAndPlay(0);
}

function closeFn() {
  clickSd.play();
  activateButtonsQuz();
  hideFB();
}
function over(e) {
  e.currentTarget.gotoAndStop(1);
}
function over2(e) {
  e.currentTarget.gotoAndStop(2);
}

function out(e) {
  e.currentTarget.gotoAndStop(0);
}

function over_pic(e) {
  exportRoot["a" + e.currentTarget.id + "_pic"].gotoAndStop(1);
}

function out_pic(e) {
  exportRoot["a" + e.currentTarget.id + "_pic"].gotoAndStop(0);
}
