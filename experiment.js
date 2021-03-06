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
    var valueToStop;
    var startedGame = false;
    var startedTrial = false;
    var startButton;
    var startText;
    var clicked = false;
    var bg;
    var red;
    var canvas = document.getElementsByTagName("canvas")[0];

    canvas.addEventListener("click", copy);
    var colors = ["red","green","blue","purple"];
    var continueText;
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
    var experimentValue;
    var gold1,gold2,gold3,gold4;
    var stimulusLength;
    var reticle;
    var wrong_red;
    var wrong_blue;
    var wrong_green;
    var wrong_purple;
    var haveKey = false;
    var keyCircle;
    var gameOver;
    var codeText;
    var currentTrial;
    var generatedString;
    var poissonMean = 40;
    var inTheMiddle = false;
    var TIMEOUT_BETWEEN_BOXES = 700;
    var TIME_PER_TRIAL = 3000;
    var TRIAL_LENGTH;
    var RULES = "The goal of the game is finding the treasure, which lies in one of four chests. \
                 \n\nYou will receive a bonus of 2 cents for every 5 times you get the treasure. \
                 \n\nThere will be around 400 sets of chests in all. \
                 \n\nUse your key to open chests by clicking on them. \
                 \n\n\n\nA red X means the chest is empty, while a green circle means you have found the treasure.";
    var RULES2 = "To open a chest, you need a key. You can collect one by hovering over the key with your mouse.\
                  \n\nYou can (and should) open multiple chests until you find the treasure or the time runs out. \
                  \n\nAfter you open a box, GO TO THE CENTER to recollect the key.\
                  \n\nA KEY IS COLLECTED WHEN IT IS CIRCLED. The cirlce will disappear when you have to collect it.\
                  \n\nHowever, it takes time to open each chest, so you must choose wisely if you want to find the treasure. \
                  \n\nOnce you have found the treasure or time has run out, press SPACE to move to a new set of chests." ;
    var RULES3 = "You will now get 10 chances to practice. \
                 \n\nThese chances are just to help you get used to the game. \
                 \n\nThe treasures which are found will not be counted. \
                 \n\nDuring Practice, the chest which holds the treasure is chosen randomly.";
    var RULES4 = "The practice is now over. Click START to start the actual game. Good Luck!"
    var FINAL_TEXT_1 = "Well done! The experiment is now over. Thank you for your participation! \
                        \n\nYou have just taken part in an experiment which studies how people adapt and learn over repetitions of a game. \
                        \n\nYou obtained a score of "
    var FINAL_TEXT_2 = "\n\nPlease use the following code to get your reward:"
    var DISTRIBUTIONS =[[0.56288977,0.23275087,0.10154163,0.10281774],
                        [0.42160117,0.32982044,0.12497067,0.12360773],
                        [0.56401921,0.2892703 ,0.05822179,0.08848871],
                        [0.53711527,0.25346628,0.10702134,0.10239711],
                        [0.43569614,0.32735099,0.10802439,0.12892849],
                        [0.53713425,0.3055511 ,0.06564383,0.09167081],
                        [0.40448539,0.38128508,0.11105627,0.10317327],
                        [0.50103833,0.3170173 ,0.08074354,0.10120082],
                        [0.4768727 ,0.25458778,0.12529084,0.14324868],
                        [0.48350877,0.30564096,0.0905355 ,0.12031476],
                        [0.48107627,0.32530015,0.11520581,0.07841777]];
    var USED_DISTRIBUTIONS = [];
    var CHESTS_OPENED = 0;
    var TREASURE_FOUND = 0;
    var TOTAL_TRIALS = 0;
    var GAME_OVER_THRESHOLD = 400;
    var DEMO = false;
    var isGameOver = false;
    var banner;

    function randomPoisson(n)
    {
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

    function progress(n)
    {
        return Math.round(Math.floor(n / 22.5) * 5);
    }

    function setupNewBackground()
    {
        epoch = 0;
        currentDistribution = generateNewDistribution();
        distributions.push(currentDistribution);
        currentBackground = pickNewBackground();
        if (currentBackground != "")
            backgrounds.push(currentBackground);
    }

    function uuidv4()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
        {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generateNewDistribution()
    {
        possible_distributions = [];
        for(i=0; i<9; i++)
        {
            found = false;
            for(j=0; j<USED_DISTRIBUTIONS.length; j++)
            {
                if (i == USED_DISTRIBUTIONS[j])
                {
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                possible_distributions.push(i);
            }
        }
        chosenDistribution = DISTRIBUTIONS[possible_distributions[Math.floor(Math.random() * possible_distributions.length)]];
        d = chooseColors(chosenDistribution)
        return d;
    }

    function chooseColors(chosenDistribution)
    {
        firstColor = colors[Math.floor(Math.random() * 4)];
        d = new Object();
        d[firstColor] = chosenDistribution[0];
        secondCounter = Math.ceil(Math.random() * 3);
        var i;
        var counter = 0;
        var secondColor;
        for (i=0; i<=3; i++)
        {
            if (colors[i] == firstColor)
                continue;
            counter += 1;
            if (counter == secondCounter)
            {
                d[colors[i]] = chosenDistribution[1];
                secondColor = colors[i];
            }
        }


        thirdCounter =Math.ceil(Math.random() * 2);
        counter = 0;
        var thirdColor;
        for (i=0; i<=3; i++)
        {
            if (colors[i] === firstColor || colors[i] === secondColor)
                continue;
            counter += 1;
            if (counter === thirdCounter)
            {
                d[colors[i]] = chosenDistribution[2];
                thirdColor = colors[i];
            }
        }

        fourthCounter = 1;
        counter = 0;
        for (i=0; i<=3; i++)
        {
            if (colors[i] === firstColor || colors[i] === secondColor || colors[i] === thirdColor)
                continue;
            counter += 1;
            if (counter === fourthCounter)
                d[colors[i]] = chosenDistribution[3];
        }

        return d;
    }

    function copy(){
      if(isGameOver) {
        var el = document.createElement('textarea');
        el.value = generatedString;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
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
        if (availableBackgrounds.length == 0)
        {
            return "";
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

    function pickWinnerAtRandom()
    {
        var rgn = Math.floor(Math.random() * 4.0);
        return colors[rgn];
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
        this.load.image('island',"assets/island.png");
        this.load.image('hourglass',"assets/hourglass.png");
        this.load.image('correct',"assets/correct.png");
        this.load.image('mini_correct',"assets/mini_correct.png");
        this.load.image('button',"assets/button.png");
        this.load.image('key_correct', "assets/correct_key.png");
        this.load.spritesheet('gold', 'assets/gold.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('key', 'assets/KeyIcons.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('treasure_chests', 'assets/treasure_chests.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('bigKey', 'assets/keyIconsBig.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('wrong','assets/wrong.png');
    }

    function chooseNewStimulusCRP()
    {
        TOTAL_TRIALS = TOTAL_TRIALS + epoch
        if (TOTAL_TRIALS >= GAME_OVER_THRESHOLD)
        {
            gameOver(this);
            return;
        }
        epoch = 0;
        N = distributions.length;
        rgn = Math.random();
        if (rgn > ((N - 1.0) / (N + 1.0)))
        {
          setupNewBackground(this);
        }
        else
        {
            s = 0;
            for (ii = 0; ii < N; ii++)
            {
                if (backgrounds[ii]!==currentBackground)
                {
                    s = s + 1.0 / (N + 1.0);
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

    function resetTrial()
    {
        continueText.setVisible(true);
        document.body.onkeyup = function(e){
        if(e.keyCode == 32)
        {
            epoch += 1;
            valueToStop = -1;
            red.setTexture("red");
            blue.setTexture("blue");
            green.setTexture("green");
            purple.setTexture("purple");
            opened["red"] = false;
            opened["green"] = false;
            opened["blue"] = false;
            opened["purple"] = false;
            clicked = false;
            makeEverythingInvisible();
            winner = pickWinnerAtRandom();
            if (epoch === TRIAL_LENGTH)
            {
                endPractice();
            }
            else {
              reticle.alpha = 0.5;
              keyCircle.setVisible(false);
              haveKey = false;
              var now = new Date().getTime();
              countDownDate = now + TIME_PER_TRIAL;
            }
            document.body.onkeyup = null;
            continueText.setVisible(false);
        }
        };
    }

    function endPractice()
    {
      makeEverythingInvisible();
      startedTrial = false;
      inTheMiddle = true;
      //treasure_found.setVisible(false);
      red.setVisible(false);
      green.setVisible(false);
      blue.setVisible(false);
      purple.setVisible(false);
      reticle.setVisible(false);
      bg.setVisible(false);
      keyCircle.setVisible(false);
      hourglass.setVisible(false);
      score_gold.children.each(function(c) { c.setVisible(false);});
      banner.destroy();
      startText.setVisible(true);
      startButton.setVisible(true);
    }


    function resetGame()
    {
        continueText.setVisible(true);
        document.body.onkeyup = function(e){
        if(e.keyCode == 32)
        {
            valueToStop = -1;
            red.setTexture("red");
            blue.setTexture("blue");
            green.setTexture("green");
            purple.setTexture("purple");
            opened["red"] = false;
            opened["green"] = false;
            opened["blue"] = false;
            opened["purple"] = false;
            clicked = false;
            makeEverythingInvisible();
            winner = pickWinner(currentDistribution)
            epoch += 1;
            CHESTS_OPENED += 1;
            chest_score.setText(progress(CHESTS_OPENED).toString() + "% DONE");
            RESULTS['winner'].push(winner);
            RESULTS['trials'].push(currentTrial);
            currentTrial = []
            if (epoch == stimulusLength)
            {
                sendToServer();
                d = new Object();
                chooseNewStimulusCRP(this);

                if (!isGameOver)
                {
                    stimulusLength = randomPoisson(poissonMean);
                    if(RESULTS["experiment"] == "A")
                    {
                        bg.setTexture(currentBackground);
                    }
                    d = new Object();
                    d.start_trial = TOTAL_TRIALS + 1;
                    d.end_trial = TOTAL_TRIALS + stimulusLength;
                    d.background_name = currentBackground;
                    d.dist = currentDistribution;
                    RESULTS['distributions'].push(d);
                }
            }
            reticle.setVisible(true);
            reticle.alpha = 0.5;
            keyCircle.setVisible(false);
            haveKey = false;

            var now = new Date().getTime();
            countDownDate = now + TIME_PER_TRIAL;
            document.body.onkeyup = null;
            continueText.setVisible(false);
        }
        };
    }

    function create ()
    {
      experimentValue = Math.random();
      if(DEMO)
      {
          poissonMean = 4;
          GAME_OVER_THRESHOLD = 2;
          TRIAL_LENGTH = 3;
      }
      else
      {
          poissonMean = 40;
          GAME_OVER_THRESHOLD = 400;
          TRIAL_LENGTH = 10;
      }
      showIntro.call(this);
    }

    function showIntro()
    {
        reticle = this.add.sprite(427, 225, 'key',frame=2).setInteractive();
        chest = this.add.sprite(854, 225, 'treasure_chests', frame=19);
        rules_text = this.add.text(100, 100, RULES.toUpperCase(), { fill: '#0f0' });
        chest2 = this.add.sprite(427, 400, 'red_open', frame=19);
        correct_red = this.add.sprite(427, 400, 'wrong');
        chest3 = this.add.sprite(854, 400, 'red_open', frame=19);
        wrong_red = this.add.sprite(854, 400, 'correct');
        red_gold = this.physics.add.staticGroup();
        red_gold1 = this.add.sprite(854,400, 'gold', frame = 13);
        red_gold2 = this.add.sprite(870,400, 'gold', frame = 12);
        red_gold3 = this.add.sprite(838,400, 'gold', frame = 9);
        red_gold4 = this.add.sprite(854,384, 'gold', frame = 10);
        red_gold5 = this.add.sprite(870,384, 'gold', frame = 9);
        red_gold.add(red_gold1);
        red_gold.add(red_gold2);
        red_gold.add(red_gold3);
        red_gold.add(red_gold4);
        red_gold.add(red_gold5);
        clickButton = this.add.text(540, 550, "NEXT", {fill:'#0f0', font:'65px Arial'}).setInteractive()
       .on('pointerdown', () => showIntro_Part2.call(this));
    }

    function showIntro_Part2()
    {
        clickButton.destroy();
        rules_text.destroy();
        red_gold.children.each(function(c) { c.destroy();});
        chest.destroy();
        chest2.destroy();
        chest3.destroy();
        correct_red.destroy();
        wrong_red.destroy();
        reticle.destroy();
        startText = this.add.text(100,100, RULES4.toUpperCase(), {fill:'#0f0'});
        startText.setVisible(false);
        startButton = this.add.text(520, 400, "START", {fill:'#0f0', font:'65px Arial'}).setInteractive();
        startButton.setVisible(false);
        startButton.setInteractive().on('pointerdown', function(){
            if(inTheMiddle)
            {
              startGame();
            }
        });
        rules_text = this.add.text(100, 200, RULES2.toUpperCase(), { fill: '#0f0' });
        clickButton = this.add.text(540, 450, "NEXT", {fill:'#0f0', font:'65px Arial'}).setInteractive()
        .on('pointerdown', () => showIntro_Part3.call(this));
    }

    function showIntro_Part3()
    {
        clickButton.destroy();
        rules_text.destroy();
        rules_text = this.add.text(100, 200, RULES3.toUpperCase(), { fill: '#0f0' });
        clickButton = this.add.text(520, 360, "START", {fill:'#0f0', font:'65px Arial'}).setInteractive()
        .on('pointerdown', () => startTrial.call(this));
    }

    function startTrial(){
        clickButton.destroy();
        rules_text.destroy();
        chest.destroy();
        reticle.destroy();
        startedTrial = true;
        winner = pickWinnerAtRandom();
        var now = new Date().getTime();
        countDownDate = now + TIME_PER_TRIAL;
        epoch = 0;

        bg = this.add.tileSprite(640, 360, 1280, 720, "mountains");
        banner = this.add.text(475, 20, "PRACTICE", {fill:'#f00', font:'65px Arial'}).setInteractive();
        red = this.add.sprite(440,  170, 'red').setInteractive();
        blue = this.add.sprite(440, 550, 'blue').setInteractive();
        green = this.add.sprite(840, 550, 'green').setInteractive();
        purple = this.add.sprite(840,170, 'purple').setInteractive();
        red_gold = this.physics.add.staticGroup();
        blue_gold = this.physics.add.staticGroup();
        green_gold = this.physics.add.staticGroup();
        purple_gold = this.physics.add.staticGroup();
        score_gold = this.physics.add.staticGroup();

        red_gold1 = this.add.sprite(440,170, 'gold', frame = 13);
        red_gold2 = this.add.sprite(456,170, 'gold', frame = 12);
        red_gold3 = this.add.sprite(424,170, 'gold', frame = 9);
        red_gold4 = this.add.sprite(440,154, 'gold', frame = 10);
        red_gold5 = this.add.sprite(456,154, 'gold', frame = 9);

        red_gold.add(red_gold1);
        red_gold.add(red_gold2);
        red_gold.add(red_gold3);
        red_gold.add(red_gold4);
        red_gold.add(red_gold5);
        red_gold.toggleVisible();

        blue_gold1 = this.add.sprite(440,550, 'gold', frame = 13);
        blue_gold2 = this.add.sprite(456,550, 'gold', frame = 12);
        blue_gold3 = this.add.sprite(424,550, 'gold', frame = 9);
        blue_gold4 = this.add.sprite(440,534, 'gold', frame = 10);
        blue_gold5 = this.add.sprite(456,534, 'gold', frame = 9);

        blue_gold.add(blue_gold1);
        blue_gold.add(blue_gold2);
        blue_gold.add(blue_gold3);
        blue_gold.add(blue_gold4);
        blue_gold.add(blue_gold5);
        blue_gold.toggleVisible();

        green_gold1 = this.add.sprite(840,550, 'gold', frame = 13);
        green_gold2 = this.add.sprite(856,550, 'gold', frame = 12);
        green_gold3 = this.add.sprite(824,550, 'gold', frame = 9);
        green_gold4 = this.add.sprite(840,534, 'gold', frame = 10);
        green_gold5 = this.add.sprite(856,534, 'gold', frame = 9);

        green_gold.add(green_gold1);
        green_gold.add(green_gold2);
        green_gold.add(green_gold3);
        green_gold.add(green_gold4);
        green_gold.add(green_gold5);
        green_gold.toggleVisible();

        purple_gold1 = this.add.sprite(840,170, 'gold', frame = 13);
        purple_gold2 = this.add.sprite(856,170, 'gold', frame = 12);
        purple_gold3 = this.add.sprite(824,170, 'gold', frame = 9);
        purple_gold4 = this.add.sprite(840,154, 'gold', frame = 10);
        purple_gold5 = this.add.sprite(856,154, 'gold', frame = 9);

        purple_gold.add(purple_gold1);
        purple_gold.add(purple_gold2);
        purple_gold.add(purple_gold3);
        purple_gold.add(purple_gold4);
        purple_gold.add(purple_gold5);
        purple_gold.toggleVisible();

        hourglass = this.add.sprite(50, 50, 'hourglass');
        timeleft = this.add.text(100, 30, '5', {fontSize:'50px', fill:'#000'});
        red.inputEnabled = true;
        blue.inputEnabled = true;
        green.inputEnabled = true;
        purple.inputEnabled = true;
        reticle.inputEnabled = true;

        wrong_purple = this.add.sprite(840, 170, 'wrong');
        wrong_purple.setVisible(false);
        wrong_red = this.add.sprite(440, 170, 'wrong');
        wrong_red.setVisible(false);
        wrong_green = this.add.sprite(840, 550, 'wrong');
        wrong_green.setVisible(false);
        wrong_blue = this.add.sprite(440, 550, 'wrong');
        wrong_blue.setVisible(false);

        correct_red = this.add.sprite(440, 170, 'correct');
        correct_red.setVisible(false);
        correct_purple = this.add.sprite(840, 170, 'correct');
        correct_purple.setVisible(false);
        correct_green = this.add.sprite(840, 550, 'correct');
        correct_green.setVisible(false);
        correct_blue = this.add.sprite(440, 550, 'correct');
        correct_blue.setVisible(false);

        red.setInteractive().on('pointerdown', function(){
            if(!isGameOver && !clicked && !opened["red"] && haveKey)
            {
                haveKey = false;
                opened["red"] = true;
                openRed.call(this, startedTrial);
            }
        }, this);

        blue.setInteractive().on('pointerdown', function(){
            if(!isGameOver && !clicked && !opened["blue"] && haveKey)
            {
                haveKey = false;
                opened["blue"] = true;
                openBlue.call(this, startedTrial);
            }
        }, this);

        green.setInteractive().on('pointerdown', function(){
            if(!isGameOver && !clicked && !opened["green"] && haveKey)
            {
                haveKey = false;
                opened["green"] = true;
                openGreen.call(this, startedTrial);
            }
        }, this);

        purple.setInteractive().on('pointerdown', function(){
            if(!isGameOver && !clicked && !opened["purple"] && haveKey)
            {
                haveKey = false;
                opened["purple"] = true;
                openPurple.call(this, startedTrial);
            }
        }, this);

        reticle = this.add.sprite(640, 360, 'bigKey',frame=2).setInteractive();
        reticle.on('pointerover', function(){
            if (!haveKey){
                haveKey = true;
                reticle.alpha = 1;
                keyCircle.setVisible(true);
            }
        })
        keyCircle = this.add.sprite(640, 360, 'key_correct').setInteractive();
        keyCircle.setVisible(false);

        //treasure_found = this.add.sprite(1100, 50, 'treasure_chests', frame = 39);
        score_gold1 = this.add.sprite(1100,100, 'gold', frame = 13);
        score_gold2 = this.add.sprite(1116,100, 'gold', frame = 12);
        score_gold3 = this.add.sprite(1084,100, 'gold', frame = 9);
        score_gold4 = this.add.sprite(1100,84, 'gold', frame = 10);
        score_gold5 = this.add.sprite(1116,84, 'gold', frame = 9);

        score_gold.add(score_gold1);
        score_gold.add(score_gold2);
        score_gold.add(score_gold3);
        score_gold.add(score_gold4);
        score_gold.add(score_gold5);

        chest_score = this.add.text(1050, 35, '', {fontSize: '32px', fill: '#000'});
        treasure_score = this.add.text(1150, 85, '0', {fontSize:'32px', fill:"#000"});

        timeUp = this.add.text(480, 315, "TIME'S UP", {fill:'#000', font:'65px Arial'}).setInteractive()
        timeUp.setVisible(false);
        gameOverText = this.add.text(100, 180, FINAL_TEXT_1.toUpperCase() + FINAL_TEXT_2.toUpperCase(), {fill:'#0f0'});
        gameOverText.setVisible(false);
        generatedString = uuidv4();
        codeText = this.add.text(300, 300, generatedString, {fill:'#f00', font:'40px Arial'});
        codeText.setVisible(false);

        copyButton = this.add.sprite(650, 450, "button").setInteractive();
        copyText = this.add.text(450,410, "COPY CODE", {fill:'#f00', font:'65px Arial'});
        copyButton.setVisible(false);
        copyText.setVisible(false);
        copyButton.on("pointerdown", function() {
            if(isGameOver){
                copyText.setText("    COPIED")
            }
        });
        continueText = this.add.text(550, 650,  "Press SPACEBAR to continue", {fill:'#000', font:'15px Arial'});
        continueText.setVisible(false);

    }

    function startGame(){
        startText.destroy();
        startButton.destroy();

        red.setVisible(true);
        green.setVisible(true);
        blue.setVisible(true);
        purple.setVisible(true);
        reticle.setVisible(true);
        bg.setVisible(true);
        hourglass.setVisible(true);
        score_gold.children.each(function(c) { c.setVisible(true);});
        //treasure_found.setVisible(true);
        haveKey = false;

        startedGame = true;
        RESULTS = new Object();
        RESULTS['distributions'] = [];
        RESULTS['trials'] = [];
        RESULTS['winner'] = [];
        RESULTS['timeout'] = [];
        RESULTS['experiment'] = "B";
        currentTrial = [];
        setupNewBackground(this);
        winner = pickWinner(currentDistribution);
        stimulusLength = randomPoisson(poissonMean);
        if (RESULTS['experiment'] == "A")
        {
            bg.setTexture(currentBackground);
        }
        else
        {
            bg.setTexture("lake");
        }
        d = new Object();
        d.start_trial = 1;
        d.end_trial = stimulusLength;
        d.background_name = currentBackground;
        d.dist = currentDistribution;
        RESULTS['distributions'].push(d);

        var now = new Date().getTime();
        countDownDate = now + TIME_PER_TRIAL;
    }

    function openPurple(trial){
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        distance = (distance %(1000 * 60)) / 1000;
        if (!trial)
        {
            t = new Object();
            t.colour = "purple";
            t.reaction_time = seconds;
            t.order = getOrder("purple", currentDistribution);
            currentTrial.push(t);
        }


        if (!clicked)
        {
            clicked = true;
            purple.setTexture("purple_open");
            if (!trial)
            {
                //CHESTS_OPENED += 1;
                //chest_score.setText(CHESTS_OPENED);
                if (winner === "purple")
                {
                    TREASURE_FOUND += 1;
                    RESULTS['timeout'].push(false);
                    treasure_score.setText(TREASURE_FOUND);
                    correct_purple.setVisible(true);
                    purple_gold.toggleVisible();
                    valueToStop = distance;
                    resetGame(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_purple.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }
            }
            else
            {
                if (winner === "purple")
                {
                    correct_purple.setVisible(true);
                    purple_gold.toggleVisible();
                    valueToStop = distance;
                    resetTrial(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_purple.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES);
                }
            }
        }
    }

    function openRed(trial){
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        distance = (distance %(1000 * 60)) / 1000;
        if(!trial)
        {
            t = new Object();
            t.colour = "red";
            t.reaction_time = seconds;
            t.order = getOrder("red", currentDistribution);
            currentTrial.push(t);
        }

        if (!clicked)
        {
            clicked = true;
            red.setTexture("red_open");
            if(!trial)
            {
                //CHESTS_OPENED += 1;
                //chest_score.setText(CHESTS_OPENED);
                if (winner === "red")
                {
                    red_gold.toggleVisible();
                    correct_red.setVisible(true);
                    RESULTS['timeout'].push(false);
                    TREASURE_FOUND += 1;
                    treasure_score.setText(TREASURE_FOUND);
                    valueToStop = distance;
                    resetGame(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_red.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }
            }
            else
            {
                if (winner === "red")
                {
                    red_gold.toggleVisible();
                    correct_red.setVisible(true);
                    valueToStop = distance;
                    resetTrial(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_red.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }
            }
        }
    }

    function openGreen(trial){
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        distance = (distance %(1000 * 60)) / 1000;
        if (!trial)
        {
            t = new Object();
            t.colour = "green";
            t.reaction_time = seconds
            t.order = getOrder("green", currentDistribution);
            currentTrial.push(t);
        }


        if (!clicked)
        {
            clicked = true;
            green.setTexture("green_open");
            if(!trial)
            {
                //CHESTS_OPENED += 1;
                //chest_score.setText(CHESTS_OPENED);
                if (winner === "green")
                {
                    TREASURE_FOUND += 1;
                    RESULTS['timeout'].push(false);
                    correct_green.setVisible(true);
                    treasure_score.setText(TREASURE_FOUND);
                    green_gold.toggleVisible();
                    valueToStop = distance;
                    resetGame(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_green.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }
            }
            else
            {
                if (winner === "green")
                {
                    correct_green.setVisible(true);
                    green_gold.toggleVisible();
                    valueToStop = distance;
                    resetTrial(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_green.setVisible(true)
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }
            }
        }
    }


    function openBlue(trial)
    {
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = ((TIME_PER_TRIAL - distance) % (1000 * 60)) / 1000;
        distance = (distance %(1000 * 60)) / 1000;
        if(!trial)
        {
            t = new Object();
            t.colour = "blue";
            t.reaction_time = seconds;
            t.order = getOrder("blue", currentDistribution);
            currentTrial.push(t);
        }


        if (!clicked)
        {
            clicked = true;
            blue.setTexture("blue_open");
            if(!trial)
            {
                //CHESTS_OPENED += 1;
                //chest_score.setText(CHESTS_OPENED);
                if (winner === "blue")
                {
                    TREASURE_FOUND += 1;
                    RESULTS['timeout'].push(false);
                    treasure_score.setText(TREASURE_FOUND);
                    correct_blue.setVisible(true);
                    blue_gold.toggleVisible();
                    valueToStop = distance;
                    resetGame(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_blue.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }

            }
            else
            {
                if (winner === "blue")
                {
                    correct_blue.setVisible(true);
                    blue_gold.toggleVisible();
                    valueToStop = distance;
                    resetTrial(this);
                }
                else
                {
                    reticle.alpha = 0.5;
                    keyCircle.setVisible(false);
                    setTimeout(function()
                    {
                        clicked = false;
                        wrong_blue.setVisible(true);
                    }, TIMEOUT_BETWEEN_BOXES) ;
                }
            }
        }
      }


function update() {
    if ((startedGame || startedTrial) && !isGameOver)
    {
        now = new Date().getTime();
        var distance = countDownDate - now;
        var seconds = (distance % (1000 * 60)) / 1000;

        if ((distance < 0) && (!clicked))
        {
            timeleft.setText("-");
            displayWinner();
            timeUp.setVisible(true);

            if(!startedTrial)
            {
                RESULTS['timeout'].push(true);
                resetGame(this);
            }
            else
            {
                resetTrial(this);
            }
        }
        else
        {
            if(valueToStop > 0)
            {
                timeleft.setText(valueToStop.toFixed(1));
            }
            else
            {
                if(distance < 0)
                {
                    timeleft.setText("-");
                }
                else{
                    timeleft.setText(seconds.toFixed(1));
                }

            }

        }
    }
}

function getOrder(colour, distribution)
{
    var col;
    var answer = 1;
    for (cc in colors)
    {
        col = colors[cc];
        if (col === colour)
            continue;
        if (distribution[col] > distribution[colour])
            answer += 1;
    }
    return answer;
}

function displayWinner(){
    clicked = true;
    red.setTexture("red_open");
    blue.setTexture("blue_open");
    green.setTexture("green_open");
    purple.setTexture("purple_open");
    if (winner === "red"){
        red_gold.children.each(function(c) { c.setVisible(true);});
        wrong_blue.setVisible(true);
        wrong_green.setVisible(true);
        wrong_purple.setVisible(true);
        correct_red.setVisible(true);
    }
    if (winner === "blue"){
        blue_gold.children.each(function(c) { c.setVisible(true);});
        wrong_red.setVisible(true);
        wrong_green.setVisible(true);
        wrong_purple.setVisible(true);
        correct_blue.setVisible(true);
    }
    if (winner === "green"){
        green_gold.children.each(function(c) { c.setVisible(true);});
        wrong_red.setVisible(true);
        wrong_blue.setVisible(true);
        wrong_purple.setVisible(true);
        correct_green.setVisible(true);

    }
    if (winner === "purple"){
        purple_gold.children.each(function(c) { c.setVisible(true);});
        wrong_red.setVisible(true);
        wrong_green.setVisible(true);
        wrong_blue.setVisible(true);
        correct_purple.setVisible(true);
    }
}

function makeEverythingInvisible()
{
    wrong_purple.setVisible(false);
    wrong_red.setVisible(false);
    wrong_green.setVisible(false);
    wrong_blue.setVisible(false);

    correct_purple.setVisible(false);
    correct_red.setVisible(false);
    correct_green.setVisible(false);
    correct_blue.setVisible(false);

    timeUp.setVisible(false);

    red_gold.children.each(function(c) { c.setVisible(false);});
    blue_gold.children.each(function(c) { c.setVisible(false);});
    green_gold.children.each(function(c) { c.setVisible(false);});
    purple_gold.children.each(function(c) { c.setVisible(false);});
}

function gameOver()
{

    isGameOver = true;

    red.destroy();
    blue.destroy();
    green.destroy();
    purple.destroy();

    red_gold.children.each(function(c) { c.destroy();});
    blue_gold.children.each(function(c) { c.destroy();});
    green_gold.children.each(function(c) { c.destroy();});
    purple_gold.children.each(function(c) { c.destroy();});
    score_gold.children.each(function(c) { c.destroy();});

    timeUp.destroy();

    wrong_purple.destroy();
    wrong_red.destroy();
    wrong_green.destroy();
    wrong_blue.destroy();

    timeleft.destroy();
    hourglass.destroy();
    bg.destroy();
    //treasure_found.destroy();
    reticle.destroy();


    gameOverText.setVisible(true);
    codeText.setVisible(true);
    treasure_score.setStyle({
        color: '#00ff00'
    });
    treasure_score.x = 410;
    treasure_score.y = 230;
    copyButton.setVisible(true);
    copyText.setVisible(true);

    sendToServer();
}

function sendToServer()
{
    var data = new FormData();
    data.append("id", generatedString);
    data.append("results", JSON.stringify(RESULTS));

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
        console.log(this.responseText);
     }
    });

    xhr.open("POST", "http://ec2-18-191-152-186.us-east-2.compute.amazonaws.com/save.php");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
}
