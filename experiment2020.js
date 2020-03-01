var config = {
        type: Phaser.AUTO,
        width: 1024,
        height: 576,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
var RESULTS = new Object();
var score = 0;
var rules;
var RULES4 = "The practice is now over. Click START to start the actual game. Good Luck!";
var cur_length = 0;
var length = 0;
var bettingPhase = true;
var throwingPhase = false;
var game = new Phaser.Game(config);
var timer;
var info;
var cube;
var times = 0;
var index = 0;
var bettingButton;
var throwingButton;
var option1;
var option2;
var option3;
var option4;
var continueText;
var correct1;
var correct2;
var correct3;
var correct4;
var selected = 0;
var instructions;
var poissonMean;
var copyButton;
var copyText;
var GAME_OVER_THRESHOLD;
var TRIAL_LENGTH;
var DEMO = true;
var CUR_TRIAL = 0;
var flag;
var nextButton;
var canvas = document.getElementsByTagName("canvas")[0];
canvas.addEventListener("click", copy);
var DISTRIBUTIONS =[[0.56288977,0.23275087,0.10281774,0.10154163],
                    [0.42160117,0.32982044,0.12497067,0.12360773],
                    [0.56401921,0.2892703 ,0.08848871,0.05822179],
                    [0.53711527,0.25346628,0.10702134,0.10239711],
                    [0.43569614,0.32735099,0.12892849,0.10802439],
                    [0.53713425,0.3055511 ,0.09167081,0.06564383,],
                    [0.40448539,0.38128508,0.11105627,0.10317327],
                    [0.50103833,0.3170173 ,0.10120082,0.08074354],
                    [0.4768727 ,0.25458778,0.14324868,0.12529084],
                    [0.48350877,0.30564096,0.12031476,0.0905355 ],
                    [0.48107627,0.32530015,0.11520581,0.07841777]];
var USED_DISTRIBUTIONS = [];
var PERMUTATIONS = [];
var COLORS = [ 0x5de65d, 0xfce205, 0xff7417, 0x46f0f0, 0x6f2da8, 0xff1493, 
               0x4B382A, 0x808588, 0xfB697F, 0xe1c699, 0xffffff, ];
var currentDistribution = DISTRIBUTIONS[0];
var currentPermutation = createPermutation();
var totalDistributions = 0;
var frequency = {};
var RULES1 = "Your task is to guess the roll of a dice. \
              \n \nThere is a catch, however: The dice only has four numbers (1,2,3,4) on its six faces.\
              \n \nYou will receive a bonus of X per correct bet, so try to get a score as high as possible."
var RULES2 = "The steps for playing are the following: \
              \n \n 1. Bet on a number by clicking on it.\
              \n \n 2. Roll the dice, by clicking \"ROLL\". When you roll the dice, your bet is locked.\
              \n \n 3. Stop the dice, by clicking \"STOP\".\
              \n \nSee if you can influence the outcome to be in your favour.";
var RULES3 = " You will now start a practice period, to get used to the game. \
              \n \n These tries do not count to your score."              
var FINAL_TEXT_1 = "Well done! The experiment is now over. Thank you for your participation! \
                        \n\nYou have just taken part in an experiment which studies how people adapt and learn over repetitions of a game. \
                        \n\nYou obtained a score of "
var FINAL_TEXT_2 = "\n\nPlease use the following code to get your reward:";
var generatedString;
var isGameOver;
var banner;
var isPractice;

function createPermutation()
{
    var permutation = [];
    permutation.push(Math.ceil(Math.random() * 4));
    for (var i=3; i>=1; i--){
        var rgn = Math.ceil(Math.random() * i);
        var count = 0;
        for(var j=1; j<=4; j++){
            if (!permutation.includes(j)){
                count+=1;
                if (count == rgn){
                    permutation.push(j);
                }
            }
        } 
    }
    return permutation;
}

function randomPoisson(n)
{
    var L = Math.exp(-n);
    var k = 0;
    var p = 1;

    while (true){
        while (p > L){
        k = k + 1;
        u = Math.random();
        p = p * u;
        }

        if (k > 1)
            break;

        k = 0;
        p = 1;
        L = Math.exp(-n);
    }
   

    return k-1;
}

function getWinner(distribution, permutation){
    var rgn = Math.random();
    s = 0;
    for (i = 0; i < 4; i++)
        console.log(permutation[i] + "has probability" + distribution[i]);
    for (i=0; i<4; i++)
    {
        s = s + distribution[i];
        if (rgn < s)
        {
            return permutation[i];
        }
    }
}

function pickWinnerAtRandom()
{
    var rgn = Math.floor(Math.random() * 4.0);
    return rgn;
}

function preload ()
{
    this.load.atlas('cube', 'assets/animations/cube.png', 'assets/animations/cube.json');
    this.load.image('correct',"assets/correct_key.png");
    this.load.image('button',"assets/button.png");
}

function startPractice(){
    nextButton.destroy();
    rules.destroy();
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNames('cube', { prefix: 'frame', start: 0, end: 23 }),
        frameRate: 50,
        repeat: -1
    });

    banner = this.add.text(380, 20, "PRACTICE", {fill:'#f00', font:'52px Arial'}).setInteractive();
    isPractice = true;
    length = randomPoisson(poissonMean);

    var group = this.add.group({ key: 'cube', frame: 'frame1', repeat: 0, setScale: { x: 1.5, y: 1.5 } });
    bettingButton = this.add.text(448, 500, "ROLL", {fill: '#080' , font:'52px Arial'}).setInteractive()
       .on('pointerdown', () => startRolling.call(this));
    throwingButton = this.add.text(448, 500, "STOP", {fill:'#f00', font:'52px Arial'}).setInteractive()
       .on('pointerdown', () => stopRolling.call(this));
    instructions = this.add.text(420, 500, "Click on a number to bet on it.", {fill:'#ff0', font:'15px Arial'});
    option1 = this.add.text(296, 420, "1", {fill:'#fff', font:'52px Arial'});
    option2 = this.add.text(432, 420, "2", {fill:'#fff', font:'52px Arial'});
    option3 = this.add.text(568, 420, "3", {fill:'#fff', font:'52px Arial'});
    option4 = this.add.text(704, 420, "4", {fill:'#fff', font:'52px Arial'});
    treasure_score = this.add.text(675, 85, 'Your score is 0', {fontSize:'32px', fill:"#080", fontStyle:"bold"});
    continueText = this.add.text(448, 500,  "NEXT", {fill:'#ff0', font:'52px Arial'}).setInteractive()
       .on('pointerdown', () => resetTrial.call(this));
    gameOverText = this.add.text(80, 144, FINAL_TEXT_1.toUpperCase() + FINAL_TEXT_2.toUpperCase(), {fill:'#0f0', font:'bold 10pt Arial'});
    gameOverText.setVisible(false);
    
    var i = 1;
    var ci = 0;

    group.children.iterate(function (child) {

        child.tint = COLORS[ci];
        child.x = 512;
        child.y = 208;
        cube = child;
    });

    info = this.add.text(420, 320, 'You rolled: ', { font: '36px Arial', fill: '#fff' });
    trialResult = this.add.text(600, 320, '', {font: '36px Arial, fill: #ff0'});
    cube.setVisible(true);
    info.setVisible(false);
    throwingButton.setVisible(false);
    continueText.setVisible(false);
    instructions.setVisible(true);
    bettingButton.setVisible(false);

    correct1 = this.add.sprite(312, 450, 'correct');
    correct1.setVisible(false);
    correct2 = this.add.sprite(448, 450, 'correct');
    correct2.setVisible(false);
    correct3 = this.add.sprite(584, 450, 'correct');
    correct3.setVisible(false);
    correct4 = this.add.sprite(720, 450, 'correct');
    correct4.setVisible(false);


    option1.setInteractive().on('pointerdown', function(){
            if(bettingPhase)
            {
                selected = 1;
                correct1.setVisible(true);
                correct2.setVisible(false);
                correct3.setVisible(false);
                correct4.setVisible(false);
                instructions.setVisible(false);
                bettingButton.setVisible(true);
            }
        }, this);

    option2.setInteractive().on('pointerdown', function(){
            if(bettingPhase)
            {
                selected = 2;
                correct1.setVisible(false);
                correct2.setVisible(true);
                correct3.setVisible(false);
                correct4.setVisible(false);
                instructions.setVisible(false);
                bettingButton.setVisible(true);
            }
        }, this);

    option3.setInteractive().on('pointerdown', function(){
            if(bettingPhase)
            {
                selected = 3;
                correct1.setVisible(false);
                correct2.setVisible(false);
                correct3.setVisible(true);
                correct4.setVisible(false);
                instructions.setVisible(false);
                bettingButton.setVisible(true);
            }
        }, this);

    option4.setInteractive().on('pointerdown', function(){
            if(bettingPhase)
            {
                selected = 4;
                correct1.setVisible(false);
                correct2.setVisible(false);
                correct3.setVisible(false);
                correct4.setVisible(true);
                instructions.setVisible(false);
                bettingButton.setVisible(true);
            }
        }, this);
    this.anims.play('spin', cube, 0.03);
    this.anims.pauseAll();

    copyButton = this.add.sprite(520, 460, 'button').setInteractive();
    copyText = this.add.text(360,428, "COPY CODE", {fill:'#f00', font:'52px Arial'});
    copyButton.setVisible(false);
    copyText.setVisible(false);
    generatedString = uuidv4();
    codeText = this.add.text(240, 340, generatedString, {fill:'#f00', font:'32px Arial'});
    codeText.setVisible(false);



    cur_length = 0;
    for (i=0; i<=10; i++)
    {
        frequency[DISTRIBUTIONS[i]] = 0;
    }
    score = 0;
    treasure_score.setText("Your score is " + score);
    RESULTS['distributions'] = [];
    RESULTS['choice'] = [];
    RESULTS['winner'] = [];
    RESULTS['experiment'] = "A";
    RESULTS['order'] = [];

    currentPermutation = [1,2,3,4];
    currentDistribution = [0.25,0.25,0.25,0.25];
}

function displayRules(){
    rules = this.add.text(20, 50, RULES1.toUpperCase(), {fill:'#40FF00'});
    nextButton = this.add.text(416, 520, "NEXT", {fill:'#40FF00', font:'52px Arial'}).setInteractive()
        .on('pointerdown', () => displayInstructions.call(this));
    nextButton.setVisible(true);
}

function displayInstructions(){
    rules.setText(RULES2.toUpperCase());
    nextButton.destroy();
    nextButton = this.add.text(416, 520, "NEXT", {fill:'#40FF00', font:'52px Arial'}).setInteractive()
        .on('pointerdown', () => displayPractice.call(this));
}

function displayPractice(){
    rules.setText(RULES3.toUpperCase());
    nextButton.destroy();
    nextButton = this.add.text(416, 520, "NEXT", {fill:'#40FF00', font:'52px Arial'}).setInteractive()
        .on('pointerdown', () => startPractice.call(this));
}


function create ()
{
    if(DEMO)
    {
        poissonMean = 4;
        GAME_OVER_THRESHOLD = 20;
        TRIAL_LENGTH = 3;
    }
    else
    {
        poissonMean = 40;
        GAME_OVER_THRESHOLD = 400;
        TRIAL_LENGTH = 3;
    }

    displayRules.call(this);
}

function update(){
    // 1213121412
    if (throwingPhase){
        times += 1;
        if (times % 12 == 0){
            if (index % 2 == 0){
                if (flag){
                    flag =  false;
                    console.log("I am correct");
                }
                trialResult.setText(currentPermutation[0]);
                trialResult.setFont('Arial');
                trialResult.setFontSize('36px');
                trialResult.setFill('#fff');
                trialResult.setVisible(true);
            }
            else if (index == 1 || index == 5 || index == 9)
            {
                if (flag){
                    flag =  false;
                    console.log("I am wrong");
                }
                trialResult.setText(currentPermutation[1]);
                trialResult.setFont('Arial');
                trialResult.setFontSize('36px');
                trialResult.setFill('#fff');
                trialResult.setVisible(true);
            }
            else if (index == 3){
                if (flag){
                    flag =  false;
                    console.log("I am wrong");
                }
                trialResult.setText(currentPermutation[2]);
                trialResult.setFont('Arial');
                trialResult.setFontSize('36px');
                trialResult.setFill('#fff');
                trialResult.setVisible(true);
            }
            else if (index == 7){
                if (flag){
                    flag =  false;
                    console.log("I am wrong");
                }
                trialResult.setText(currentPermutation[3]);
                trialResult.setFont('Arial');
                trialResult.setFontSize('36px');
                trialResult.setFill('#fff');
                trialResult.setVisible(true);
            }
            index = (index + 1) % 10;
            times = 0;
        } 
        cube.angle += 1;
    }
}

function startRolling(){
    console.log(times);
    if (selected != 0)
    {
        info.setVisible(true);
        trialResult.setText(currentPermutation[0]);
        trialResult.setFont('Arial');
        trialResult.setFontSize('36px');
        trialResult.setFill('#fff');
        trialResult.setVisible(true);

        throwingPhase = true;
        bettingPhase = false;
        this.anims.resumeAll();
        bettingButton.setVisible(false);
        throwingButton.setVisible(true);  
    }
}

function stopRolling(){
    this.anims.pauseAll();
    cube.angle = 0;
    winner = getWinner(currentDistribution, currentPermutation);
    console.log(currentPermutation);
    if (winner == selected){
        score += 1;
        treasure_score.setText("Your score is " + score);
        trialResult.setText(winner)
        trialResult.setFont('Arial');
        trialResult.setFontSize('36px');
        trialResult.setFill('#080');
    }
    else{
        trialResult.setText(winner)
        trialResult.setFont('Arial');
        trialResult.setFontSize('36px');
        trialResult.setFill('#f00');
    }
    bettingButton.setVisible(false);
    throwingButton.setVisible(false);
    throwingPhase = false;
    continueText.setVisible(true);
}

function getOrder(permutation, number){
    for (i=0; i<4; i++){
        if (permutation[i] == number)
        {
            return i+1;
        }
    }
}

function endPractice(){
    banner.destroy();
    /// make stuff invisible;
    option1.setVisible(false);
    option2.setVisible(false);
    option3.setVisible(false);
    option4.setVisible(false);
    correct1.setVisible(false);
    correct2.setVisible(false);
    correct3.setVisible(false);
    correct4.setVisible(false);
    info.setVisible(false);
    trialResult.setVisible(false);
    continueText.setVisible(false);
    instructions.setVisible(false);
    bettingButton.setVisible(false);
    throwingButton.setVisible(false);
    cube.setVisible(false);
    treasure_score.setVisible(false);


    // Reset the results.
    score = 0;
    treasure_score.setText("Your score is " + score);
    RESULTS['distributions'] = [];
    RESULTS['choice'] = [];
    RESULTS['winner'] = [];
    RESULTS['experiment'] = "A";
    RESULTS['order'] = [];

    for (i=0; i<=10; i++)
    {
        frequency[DISTRIBUTIONS[i]] = 0;
    }

    // Prepare for starting Game.

    startText = this.add.text(80,80, RULES4.toUpperCase(), {fill:'#0f0'});
    startText.setVisible(true);
    startButton = this.add.text(416, 320, "START", {fill:'#0f0', font:'52px Arial'}).setInteractive()
        .on('pointerdown', () => startGame.call(this));
    startButton.setVisible(true);
}

function startGame(){
    startText.destroy();
    startButton.destroy();

    cube.setVisible(true);
    bettingPhase = true;
    throwingPhase = false;
    option1.setVisible(true);
    option2.setVisible(true);
    option3.setVisible(true);
    option4.setVisible(true);
    selected = 0;
    correct1.setVisible(false);
    correct2.setVisible(false);
    correct3.setVisible(false);
    correct4.setVisible(false);
    treasure_score.setVisible(true);
    instructions.setVisible(true);

    length = randomPoisson(poissonMean);
    currentDistribution = DISTRIBUTIONS[i];
    cur_length = 0;
    CUR_TRIAL = 0;
    for (i=0; i<=10; i++)
    {
        frequency[DISTRIBUTIONS[i]] = 0;
    }
    ii = Math.floor(Math.random() * 11);
    currentDistribution = DISTRIBUTIONS[ii];
    currentPermutation = createPermutation();
    PERMUTATIONS.push(currentPermutation);
    frequency[DISTRIBUTIONS[ii]] += 1;
    isPractice = false;

    d = new Object();
    d.start_trial = 1;
    d.end_trial = length;
    d.perm = currentPermutation;
    d.dist = currentDistribution;
    RESULTS['distributions'].push(d);
}


function resetTrial()
{
    times = 0;
    index = 1;
    flag = true;
    RESULTS['winner'].push(winner);
    RESULTS['choice'].push(selected);
    RESULTS['order'].push(getOrder(currentPermutation, selected));
    info.setVisible(false);
    trialResult.setVisible(false);
    bettingPhase = true;
    bettingButton.setVisible(false);
    continueText.setVisible(false);
    instructions.setVisible(true);
    selected = 0;
    correct1.setVisible(false);
    correct2.setVisible(false);
    correct3.setVisible(false);
    correct4.setVisible(false);
    cur_length += 1;
    if (!isPractice && cur_length == length){
        pickNewDistribution();
    }
    if (isPractice && cur_length == TRIAL_LENGTH){
        isPractice = false;
        endPractice.call(this);
    }
}

function pickNewDistribution(){
    CUR_TRIAL += cur_length;
    if (CUR_TRIAL >= GAME_OVER_THRESHOLD){
        gameOver();
    }
    else{
        length = randomPoisson(poissonMean);
        cur_length = 0;
        N = totalDistributions - frequency[currentDistribution];
        rgn = Math.random();
        var total = 0
        newDistribution = undefined;
        
        USED_DISTRIBUTIONS.forEach((distribution) => {
            if (! (JSON.stringify(currentDistribution) === JSON.stringify(distribution))){
                total += ( frequency[distribution] / (N+1) );
                if (total > rgn && typeof newDistribution === 'undefined')
                    {
                        newDistribution = distribution;
                    }
            }
        });
        if(typeof newDistribution === 'undefined'){
            newDistribution = chooseNewDistribution();
            newPermutation = createPermutation();
            USED_DISTRIBUTIONS.push(newDistribution);
            PERMUTATIONS.push(newPermutation);
        }
        frequency[newDistribution] += 1;
        totalDistributions += 1;
        currentDistribution = newDistribution;
        X = USED_DISTRIBUTIONS.length;
        for (i=0; i<X; i++){
            if (JSON.stringify(newDistribution) === JSON.stringify(USED_DISTRIBUTIONS[i])){
                cube.tint = COLORS[i];
                currentPermutation = PERMUTATIONS[i];
            }
        }
        d = new Object();
        d.start_trial = CUR_TRIAL + 1;
        d.end_trial = CUR_TRIAL + length;
        d.perm = currentPermutation;
        d.dist = currentDistribution;
        RESULTS['distributions'].push(d);
    }
}

function chooseNewDistribution(){
    var i;
    var unusedDistributions = [];
    for (i=0; i<=10; i++){
        if (!USED_DISTRIBUTIONS.includes(DISTRIBUTIONS[i])){
            unusedDistributions.push(DISTRIBUTIONS[i])
        }
    }
    X = unusedDistributions.length;
    return unusedDistributions[Math.floor(X * Math.random())];
}

function gameOver(){
    isGameOver = true;
    RESULTS['score'] = score;
    console.log(RESULTS);
    cube.destroy();
    option1.destroy();
    option2.destroy();
    option3.destroy();
    option4.destroy();
    correct4.destroy();
    correct3.destroy();
    correct2.destroy();
    correct1.destroy();
    bettingButton.destroy();
    continueText.destroy();
    throwingButton.destroy();
    info.destroy();
    trialResult.destroy();
    instructions.destroy();

    treasure_score.setStyle({
        color: '#00ff00'
    });
    treasure_score.x = 300;
    treasure_score.y = 200;
    treasure_score.setText(score);
    codeText.setVisible(true);
    copyButton.setVisible(true);
    copyText.setVisible(true);
    copyButton.on("pointerdown", function() {
            if(isGameOver){
                copyText.setText("    COPIED")
            }
        });
    gameOverText.setVisible(true);
    sendToServer();

}

function uuidv4()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
    {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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

    xhr.open("POST", "http://ec2-3-20-232-95.us-east-2.compute.amazonaws.com/save.php");
    xhr.setRequestHeader("cache-control", "no-cache");

    xhr.send(data);
}

