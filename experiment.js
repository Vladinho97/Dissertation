var config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    var game = new Phaser.Game(config);
    var clicked = false;
    var bg;
    var red;
    var colors = ["red","green","blue","purple"];
    var opened = {"red":false, "green":false, "blue":false, "purple":false};
    var epoch;
    var backgrounds = [];
    var allBackgrounds = ["waterfall", "beach", "castle", "mountains", "lake", "rocky_beach","island"];
    var distributions = [];
    var currentDistribution;
    var currentBackground;
    var bundles = [];
    var winner;
    var i;
    var gold1,gold2,gold3,gold4;
    var stimulusLength;
    var reticle;
    var poissonMean = 3;
    var TIMEOUT_BETWEEN_BOXES = 1000
    

    function randomPoisson(n) {
        var L = Math.exp(-n);
        var k = 0;
        var p = 1;

        while (p > L){
            k = k + 1;
            u = Math.random();
            p = p * u;
        } 

        return k-1;
    }

    function setupNewBackground(){
        epoch = 0;
        currentDistribution = generateNewDistribution();
        distributions.push(currentDistribution);
        currentBackground = pickNewBackground();
        backgrounds.push(currentBackground);
    }

    function generateNewDistribution()
    {
        redProb = Math.random();
        blueProb = Math.random();
        greenProb = Math.random();
        purpleProb = Math.random();
        S = redProb + blueProb + greenProb + purpleProb;
        redProb = redProb / S;
        blueProb = blueProb / S;
        greenProb = greenProb / S;
        purpleProb = purpleProb / S;
        d = {"red":redProb,
             "blue":blueProb,
             "green":greenProb,
             "purple":purpleProb};
        return d;
    }

    function pickNewBackground()
    {
        var ii = 0;
        var jj;
        availableBackgrounds = []
        for (ii = 0; ii < allBackgrounds.length; ii++)
        {
            curBg = allBackgrounds[ii];
            var found = false;
            for (jj = 0; jj < backgrounds.length; jj++)
            {
                if (curBg === backgrounds[jj])
                {
                  found = true;
                  break;
                }
            }
            if (!found)
            {
                availableBackgrounds.push(curBg);
            }
        }
        return availableBackgrounds[Math.floor(Math.random() * availableBackgrounds.length)];
    }

    function pickWinner(distribution){
        var rgn = Math.random();
        s = 0;
        for (i=0; i<colors.length; i++)
        {
          s = s + distribution[colors[i]];
          if (rgn < s)
          {
            return colors[i];
          }
        }
    }

    function preload ()
    {
        this.load.image('red', 'assets/chest_red.png');
        this.load.image('yellow', 'assets/chest_yellow.png');
        this.load.image('green', 'assets/chest_green.png');
        this.load.image('purple', 'assets/chest_purple.png');
        this.load.image('blue', 'assets/chest_blue.png');
        this.load.image('red_open', 'assets/chest_red_open.png');
        this.load.image('yellow_open', 'assets/chest_yellow_open.png');
        this.load.image('green_open', 'assets/chest_green_open.png');
        this.load.image('purple_open', 'assets/chest_purple_open.png');
        this.load.image('blue_open','assets/chest_blue_open.png');
        this.load.image('waterfall', 'assets/waterfall.jpg');
        this.load.image('castle', 'assets/castle.png');
        this.load.image('mountains', 'assets/mountains.jpg')
        this.load.image('beach', 'assets/beach.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('lake','assets/lake.jpg');
        this.load.image('rocky_beach','assets/rocky_beach.png');
        this.load.image('island',"assets/island.png")
        this.load.spritesheet('gold', 'assets/gold.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('key', 'assets/KeyIcons.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('treasure_chests', 'assets/treasure_chests.png', { frameWidth: 32, frameHeight: 32 });
    }

    function chooseNewStimulusCRP()
    {
      epoch = 0;
      N = distributions.length;
      rgn = Math.random();
      console.log(rgn);
      console.log(currentBackground);
      console.log(currentDistribution);
      console.log((N - 1.0) / (N + 1.0));
      if (rgn > ((N - 1.0) / (N + 1.0)))
      {
          console.log("NEW BACKGROUND")
          setupNewBackground(this);
      }
      else
      {
          console.log("REVERT")
          s = 0;
          for (ii = 0; ii < N; ii++)
          {
              if (backgrounds[ii]!==currentBackground)
              { 
                s = s + 1.0 / (N + 1.0);
                console.log(s);
                if (s >= rgn)
                {
                  currentDistribution = distributions[ii];
                  currentBackground = backgrounds[ii];
                  break;
                }
              }
          }
      }
    }

    function resetGame()
    {
       console.log("RESET GAME");
       console.log(currentDistribution);
       gold.toggleVisible();
       setTimeout(function(){
         red.setTexture("red");
         blue.setTexture("blue");
         green.setTexture("green");
         purple.setTexture("purple");
         opened["red"] = false;
         opened["green"] = false;
         opened["blue"] = false;
         opened["purple"] = false;
         clicked = false;
         winner = pickWinner(currentDistribution)
         epoch += 1;
         if (epoch == stimulusLength){
            console.log(backgrounds);
            console.log(distributions);
            chooseNewStimulusCRP(this);
            stimulusLength = randomPoisson(poissonMean);
            bg.setTexture(currentBackground);
         }
         gold.toggleVisible();
         reticle.setTexture("key",frame=2);
         reticle.x = 640;
         reticle.y = 320;
       }, TIMEOUT_BETWEEN_BOXES);
    }

    function create ()
    {
      console.log("CREATE")
      game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock();
    });
      
      setupNewBackground(this);
      winner = pickWinner(currentDistribution);
      stimulusLength = randomPoisson(poissonMean);

      bg = this.add.tileSprite(640, 360, 1280, 720, currentBackground);
      red = this.add.sprite(300,  550, 'red').setInteractive();
      blue = this.add.sprite(500, 550, 'blue').setInteractive();
      green = this.add.sprite(700, 550, 'green').setInteractive();
      purple = this.add.sprite(900,550, 'purple').setInteractive();
      gold = this.physics.add.staticGroup();

      gold1 = this.add.sprite(616,416, 'gold', frame = 13);
      gold2 = this.add.sprite(632,416, 'gold', frame = 12);
      gold3 = this.add.sprite(600,416, 'gold', frame = 9);
      gold4 = this.add.sprite(616,400, 'gold', frame = 10);
      gold5 = this.add.sprite(632,400, 'gold', frame = 9);

      gold.add(gold1);
      gold.add(gold2);
      gold.add(gold3);
      gold.add(gold4);
      gold.add(gold5);
      gold.toggleVisible();

      reticle = this.add.sprite(640, 360, 'key',frame=2).setInteractive();

      red.inputEnabled = true;
      blue.inputEnabled = true;
      green.inputEnabled = true;
      purple.inputEnabled = true;
      reticle.inputEnabled = true;

      this.input.on('pointermove', function (pointer) {

          // Move reticle with mouse
          reticle.x += pointer.movementX;
          reticle.y += pointer.movementY;

    }, this);

    console.log("CREATE_END")
  }

      function openRed(){
        console.log("openRed");
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          red.setTexture("red_open");
          setTimeout(function() {
              if (winner === "red"){
                resetGame(this);
              }
              else {
                clicked = false;
                reticle.setTexture("key",frame=2);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }


     function openPurple(){
       console.log("openPurple");
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          purple.setTexture("purple_open");
          setTimeout(function() {
              if (winner === "purple"){
                resetGame(this);
              }
              else {
                clicked = false;
                reticle.setTexture("key",frame=2);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }


      function openGreen(){
        console.log("openGreen");
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          green.setTexture("green_open");
          setTimeout(function() {
              if (winner === "green"){
                resetGame(this);
              }
              else{
                clicked = false;
                reticle.setTexture("key",frame=2);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }


      function openBlue(){
        console.log("openBlue");
        if (!clicked)
        {
          clicked = true;
          reticle.setTexture("treasure_chests",frame=19);
          blue.setTexture("blue_open");
          setTimeout(function() {
              if (winner === "blue"){
                resetGame(this);
              }
              else{
                clicked = false;
                reticle.setTexture("key",frame=2);
              }
          }, TIMEOUT_BETWEEN_BOXES) ;
        }
      }


function update() {

    if (checkOverlap(reticle, blue) && !opened["blue"] && !clicked)
    {
        opened["blue"] = true;
        openBlue(this);
    }
    if (checkOverlap(reticle, red) && !opened["red"] && !clicked)
    {
        opened["red"] = true;
        openRed(this);
    }
    if (checkOverlap(reticle, green) && !opened["green"] && !clicked)
    {
        opened["green"] = true;
        openGreen(this);
    }
    if (checkOverlap(reticle, purple) && !opened["purple"] && !clicked)
    {
        opened["purple"] = true;
        openPurple(this);
    }

}

function checkOverlap(spriteA, spriteB) {

    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();

    if (boundsA.x > boundsB.x && boundsA.x < boundsB.x+boundsB.width && boundsA.y>boundsB.y && boundsA.y < boundsB.y+boundsB.height)
    {
          return true;
    }
    return false;

}