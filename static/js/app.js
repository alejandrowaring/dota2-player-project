var baseURL = "https://api.opendota.com/api"

//Testing Variables
var myID = 38852221;
var myLastGame = 6216984197;

//Color palate
var goldColor = "#e7c82d"
var xpColor = "#9C167B"

// var graphLayoutDefaults = {
//     paper_bgcolor:rgb(0,0,0,0),
//     plot_bgpcolor:rgb(0,0,0,0)
// }

var radiantInfo = {
    team:"radiant",
    color:"#a6b719"
}

var direInfo = {
    team:"dire",
    color: "#d83500"
}

// Select the button
var button = d3.select("#button");

// Select the form
var form = d3.select("#form");

// Create event handlers for clicking the button or pressing the enter key
button.on("click", runEnter);
form.on("submit",runEnter);

// Create the function to run for both events
function runEnter() {
  d3.event.preventDefault();
  var inputElement = d3.select("#example-form-input");
  var inputValue = inputElement.property("value");
  getPlayer(inputValue)
}

//getPlayer(38852221)
function getPlayer(name) {
    d3.json(`${baseURL}/search?q=${name}`).then(function(data){
        //Generate some player info so something displays on the screen first while graph draws
        var playerID = data[0].account_id;
        var playerNavi = data[0].avatarfull;
        var naviBox = d3.select('svg')
        //Draw image of the players navi
        var myimage = naviBox.append('image').attr('xlink:href', playerNavi)
        //print the Player Name
        latestMatch(playerID)
    })
}

function latestMatch(playerID) {
d3.json(baseURL + "/players/" + playerID + "/recentMatches").then(function(data){
    var lastMatch = data[0]
    var pickedHero = lastMatch.hero_id
    var matchID = lastMatch.match_id
    gameAdvantageGraph(matchID,playerID)
})
}

function getHeroFromID(heroID) {
    var url = "/api/heroes"
    d3.json(url).then(function(data) {
        var filteredHero = data.filter(hero => hero.id === heroID)
        console.log(filteredHero[0].img)
    })
}
getHeroFromID(1)
function valueFlipper(value, playerTeam) {
    //If player is on Dire, you want the graph to be viewed upside-down
    if (playerTeam != true) {
        value = value * -1
    }
    return value
}

function minuitize(seconds) {
    return Math.floor(seconds / 60)
}

function gameAdvantageGraph(matchID) {
    matchURL = `${baseURL}/matches/${matchID}`
    console.log(matchURL)
    d3.json(matchURL).then(function(match){
        //get all the player's game data
        var teamfight = match.teamfights


        //Function to generate the output for the hoverInfo
        function inMinute(minute) {
            var outputString = "";
            //get the teamfights
            var teamfights = match.teamfights
            //For each Teamfight that occurs
            for (var i = 0;i < teamfights.length; i++) {
                //Check if the teamfight is applicable to the current minute
                if (minuitize(teamfights[i].start) === minute) {
                    //Get each player in the teamfight, if they killed someone, get their hero
                    for ( var j = 0 ; j < teamfights[i].players.length;j++) {
                        //Here's my one usage of another library, Checks if obj is empty and returns a bool
                        if ( ! jQuery.isEmptyObject(teamfights[i].players[j].killed)) {
                            //Start Writing the teamfight HTML
                            var currentHero = match.players[j].hero_id
                            outputString = outputString + "<h3> Hero:" + currentHero + "</h3><br>"
                            //For each of the hero kills, get the key and add it to the HTML output
                            var heroKills = teamfights[i].players[j].killed;
                            for (var [key,value] of Object.entries(heroKills)) {
                                outputString = outputString + key
                            }
                        }
                    };
                break;    
                };
            } return outputString
        }
        function itemization(minute) {
            //Give each player their own column
            var outputStr = "<div class='col'>";
            var players = match.players
            //for each player
            for (var i = 0; i < players.length; i++) {
                var currentHero = players[i].hero_id
                outputStr = outputStr + "<h3>" + currentHero + "</h3> <br><ul>"
                var purchTime = players[i].purchase_time;
                //for each of the items they bought this game
                for(var [key,value] of Object.entries(purchTime)) {
                    if (minuitize(value) === minute) {
                        outputStr = outputStr + "<li>" + key + "</li>"
                    }
                }
            } 
            outputStr = "</ul>"+ outputStr + "</div>"
            return outputStr
        }
        var playersData = match.players
        //Find the players team
        for (var i = 0 ; i < match.players.length ; i ++) {
            if (match.players[i].account_id === myID) {
                var isRadiant = match.players[i].isRadiant
            }
        }
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
            }
        }
        var advPlot = document.getElementById("goldAdv"),
        fightHoverInfo = document.getElementById("minute-stats")
        var itemHoverInfo = document.getElementById("item-stats")
        Plotly.newPlot('goldAdv', data,layout)
        console.log("Graph Drawn")
        advPlot.on('plotly_hover', function(data){
            var fightInfoText = data.points.map(function(d) {
                console.log(inMinute(d.x))
                return inMinute(d.x)
            })
            fightHoverInfo.innerHTML = fightInfoText
            var itemInfoText = data.points.map(function(d) {
                
                return itemization(d.x)
            })
            itemHoverInfo.innerHTML = itemInfoText
        })
         .on('plotly_unhover', function(data){
            fightHoverInfo.innerHTML = '';
            itemHoverInfo.innerHTML = '';
        });
    })
}
//gameAdvantageGraph(6214721378, myID)