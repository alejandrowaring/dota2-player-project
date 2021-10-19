var baseURL = "https://api.opendota.com/api"
var heroURL = "/api/heroes"
//Color palate
var goldColor = "#e7c82d"
var xpColor = "#9C167B"

var radiantInfo = {
    team:"radiant",
    color:"#a6b719"
}

var direInfo = {
    team:"dire",
    color: "#d83500"
}

//Form and button
var button = d3.select("#button");
var form = d3.select("#form");
button.on("click", runEnter);
form.on("submit",runEnter);
function runEnter() {
  //d3.event.preventDefault();
  var inputElement = d3.select("#example-form-input");
  var inputValue = inputElement.property("value");
  getPlayer(inputValue)
}

//Function to get the players information, Draw it into appropriate location, and then look for the win loss rate and the latest match
function getPlayer(name) {
    d3.json(`${baseURL}/search?q=${name}`).then(function(data){
        //Generate some player info so something displays on the screen first while graph draws
        var playerID = data[0].account_id;
        var playerNavi = data[0].avatarfull;
        var naviBox = d3.select('svg')
        //Draw image of the players navi
        var myimage = naviBox.append('image').attr('xlink:href', playerNavi)
        //print the Player Name
        document.getElementById('player-name').innerHTML = `<h1>${name}</h1>`
        winloss(playerID)
        latestMatch(playerID)
    })
}
//Function to look at the players win loss rate, Percentages and game diff
function winloss(playerID) {
    d3.json(`${baseURL}/players/${playerID}/wl`).then(function(data){
        document.getElementById('wins').innerHTML = `<h4> Wins: ${data.win} </h4>`
        document.getElementById('losses').innerHTML = `<h4> Losses: ${data.lose} </h4>`
        var perc = parseFloat(data.win / (data.win + data.lose) * 100).toFixed(2)
        document.getElementById('wlratio').innerHTML = `<h4> Winrate: ${perc}% </h4>`
        document.getElementById('diff').innerHTML = `<h4> Game Diff: ${Math.abs(data.win - data.lose)} </h4>`
    })
}

//Function to look at the players ID, and get their last match, then pass the matchID to the graph Drawing function
function latestMatch(playerID) {
    d3.json(baseURL + "/players/" + playerID + "/recentMatches").then(function(data){
        var lastMatch = data[0]
        var pickedHero = lastMatch.hero_id
        var matchID = lastMatch.match_id
        gameAdvantageGraph(matchID,playerID)
})
}

//Function to make the player viewing the page be the top of the graph no matter the team they were on, otherwise it can be confusing if winning the game goes down
function valueFlipper(value, playerTeam) {
    //If player is on Dire, you want the graph to be viewed upside-down
    if (playerTeam != true) {
        value = value * -1
    }
    return value
}

//Function to convert seconds to minutes, rounded down
function minuitize(seconds) {
    return Math.floor(seconds / 60)
}

//Function to read in the matchID, and playerID,
//Draw the hero info and extra stats
//Paint the plotly graph
//Prepare the on_click statistics to display when the graph is clicked

function gameAdvantageGraph(matchID,playerID) {
    matchURL = `${baseURL}/matches/${matchID}`
    console.log(matchURL)
    d3.json(matchURL).then(function(match){
        //Find the players team and index
        for (var i = 0 ; i < match.players.length ; i ++) {
            if (match.players[i].account_id === playerID) {
                var isRadiant = match.players[i].isRadiant
                var playerIndex = i
            }
        } 
        console.log(playerIndex)
        //Generate the game info on the top right and bottom panels
        d3.json(heroURL).then(function(heroData) {
            //Top Panel
            //Hero Image and name
            var myHero =  heroData.filter( hero => hero.id === match.players[playerIndex].hero_id)[0]
            var myHeroName = myHero.localized_name
            var myHeroImg = myHero.img
            var myHeroRole = ""
            if (myHero.roles.includes("Carry")) {
                 myHeroRole = "Carry "
            }
            if (myHero.roles.includes("Support")) {
                 myHeroRole = myHeroRole + "Support"
            }            document.getElementById('hero-name').innerHTML = "<h2>" + myHeroName + "</h2>"
            document.getElementById('hero-image').innerHTML = "<img src=" + myHeroImg + ">"
            document.getElementById('hero-role').innerHTML = "<p>" + myHeroRole + "</p>"
            document.getElementById('hero-stat').innerHTML = "<p>" + myHero.primary_attr.toUpperCase() + "</p>"
            document.getElementById('hero-range').innerHTML = "<p>" + myHero.attack_type + "</p>"
        })
        //Hero game Info
        var playerData = match.players[playerIndex]
        if(playerIndex >= 5) {var playerTeam = "Dire"} else {var playerTeam = "Radiant"}
        var playerScore = `${playerData.kills}/${playerData.deaths}/${playerData.assists}`
        switch (playerData.lane_role) {
            case 1:
                var laneRole = "Safelane Core (1)";
                break;
            case 2:
                var laneRole = "Midlane (2)"
                break;
            case 3:
                var laneRole = "Offlane Core (3)"
                break;
            case 4:
                var laneRole = "Offlane Support (4)";
                break;
            case 5:
                var laneRole = "Safelane Support (5)";
                break;
        }
        document.getElementById('game-team').innerHTML = `<h2>${playerTeam}</h2>`
        document.getElementById('game-role').innerHTML = `<p>${laneRole}</p>`
        document.getElementById('game-score').innerHTML = `<p>${playerScore}</p>`
        document.getElementById('game-obs').innerHTML = `<p>Observers Placed: ${playerData.obs_placed}</p>`
        document.getElementById('game-sens').innerHTML = `<p>Sentries Placed: ${playerData.sen_placed}</p>`
        document.getElementById('game-networth').innerHTML = `<p>${playerData.net_worth} Gold</p>`
        document.getElementById('game-xp').innerHTML = `<p>${playerData.total_xp} XP </p>`
        document.getElementById('game-apm').innerHTML = `<p>APM: ${playerData.actions_per_min}</p>`
        document.getElementById('game-stun').innerHTML = `<p>Stun Time: ${Math.round(playerData.stuns)}</p>`
        document.getElementById('game-dmg').innerHTML = `<p>Damage Dealt: ${playerData.hero_damage}</p>`
        document.getElementById('game-heal').innerHTML = `<p>Healing: ${playerData.hero_healing}</p>`
        //init the gold lists
        var xGold = [];
        var yGold = [];
        //Get the gold Advantage, with the player team at the top of the graph
        for (var [key,value] of Object.entries(match.radiant_gold_adv)) {
            xGold.push(key)
            yGold.push(valueFlipper(value,isRadiant))
        }
        //init the xp lists
        var xXP = [];
        var yXP = [];
        //get the XP
        for (var [key,value] of Object.entries(match.radiant_xp_adv)) {
            xXP.push(key)
            yXP.push(valueFlipper(value,isRadiant))
        }
        //Figure out the max from all Y lists and set it to the graph bounds on both + and -
        var allY = yGold.concat(yXP)
        var maxDiff = 0
        for (var i = 0; i < allY.length ; i++){
            if (Math.abs(allY[i]) > maxDiff) {
                //Get the absolute value + 10% so the graph doesn't sometimes draw poorly in very wild games
                maxDiff = Math.abs(allY[i] * 1.1)
            }
        }
        //Make the Traces
        var trace1 = {
            x: xGold,
            y: yGold,
            name: "Gold Advantage",
            line: {
                color: goldColor
            }
            
        }
        var trace2 = {
            x:xXP,
            y:yXP,
            name:"Experience Advantage",
            line: {
                color: xpColor
            }
        

        }
        //Make the Graph
        var data = [trace1, trace2]
        var layout = {
            xaxis:{
                title: "Minutes"
            },
            yaxis: {
                range:[maxDiff * -1 ,maxDiff]
            },
            title:"Click on times for more info"
        }
        var advPlot = document.getElementById("goldAdv"),
        fightHoverInfo = document.getElementById("minute-stats")
        var itemHoverInfo = document.getElementById("item-stats")
        Plotly.newPlot('goldAdv', data,layout)
        console.log("Graph Drawn")
        advPlot.on('plotly_click', function(data){
            var time = data.points.map(function(d) {
                return d.x
            })[0]
            d3.json(heroURL).then(function(heroData) {
                var htmlOut = `<h3 id='teamfight-title'>No Info for Minute ${time}</h3>`;
                var teamfights = match.teamfights;
                for (var i = 0; i < teamfights.length; i++) {
                    var teamfight = teamfights[i];
                    if (minuitize(teamfight.start) === time) {
                        var fightPlayers = teamfight.players;
                        var fightMin = minuitize(teamfight.start)
                        var fightSec = teamfight.start % 60
                        if (fightSec.toString().length == 1) {fightSec = "0" + fightSec}
                        var fightTime = fightMin + ":" + fightSec  
                        htmlOut = "<h3 id='teamfight-title'>Teamfight at " + fightTime + "</h3><br>"
                        for (var j = 0; j < fightPlayers.length; j++) {
                            var currPlayer = fightPlayers[j];
                            if ( j >= 5) {var teamCol = "dire-col"} else { var teamCol = "radi-col"}
                            if (! jQuery.isEmptyObject(currPlayer.killed)) {
                                //If the hero has a result, create a new row for their data
                                htmlOut = htmlOut + "<div class='row " + teamCol + "'><div class='col-xs-4'>"
                                var currHero = heroData.filter(hero => hero.id === match.players[j].hero_id)[0],
                                heroImg = currHero.img;
                                htmlOut = htmlOut + "<svg width='75' height='50'><image href='" + heroImg + "' width='75'></image> </svg></div>"
                                //Check all the heros they killed, and make a new column with that info
                                //I know the way this is displayed breaks if the hero got more than a rampage, but at that rate, good job you broke the drawing and your enemies
                                var heroKills = currPlayer.killed;
                                htmlOut = htmlOut + "<div class='col-xs-4'>"
                                for (var [key,value] of Object.entries(heroKills)) {
                                    var currHero = heroData.filter(hero => hero.name === key)[0].img
                                    htmlOut = htmlOut + "<svg width='75' height='50'><image href='" + currHero + "' width='75'></image><line x1='0' y1='0' x2='75' y2='50' stroke='red' stroke-width='5'></line></svg>"
                                }
                                htmlOut = htmlOut + "</div></div>"
                            }
                        }
                    }
                } 
                fightHoverInfo.innerHTML = htmlOut
            })
        })

    })

}
