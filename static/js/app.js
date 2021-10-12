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
  console.log(inputValue);
  getPlayer(inputValue)
}

//getPlayer(38852221)
function getPlayer(name) {
    d3.json(`${baseURL}/search?q=${name}`).then(function(data){
        var playerID = data[0].account_id;
        var playerNavi = data[0].avatarfull;
        var naviBox = d3.select('svg')
        var myimage = naviBox.append('image').attr('xlink:href', playerNavi)
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

function getHero(heroID) {
    var url = "./data/heroes.json"//`${baseURL}/heroes`
    var heroLocalName = ""
    d3.json(url).then(function(data) {
        var heroData = data.filter(d => d.id === heroID)[0]
        // console.log(heroData)
        // var ID = heroData.id
        // var heroName = heroData.name
         heroLocalName = heroData.localized_name
        // var heroObj = {
        //     "id": ID,
        //     "name": heroName,
        //     "localizedName":heroLocalName
        // }
        
    }); return heroLocalName;
}

function valueFlipper(value, playerTeam) {
    //If player is on Dire, you want the graph to be viewed upside-down
    if (playerTeam != true) {
        value = value * -1
    }
    return value
}

function gameAdvantageGraph(matchID) {
    matchURL = `${baseURL}/matches/${matchID}`
    console.log(matchURL)

    d3.json(matchURL).then(function(match){
        //get all the player's game data
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
                maxDiff = Math.abs(allY[i])
            }
        }
        //Make the Teamfight Points
        var teamfights = match.teamfights
        var teamFightTimes = [];
        var teamFightY = [];
        var teamFightLabel = [];
        for ( var i = 0; i < teamfights.length ; i++) {
            //For each Teamfight, get all the fight times
            teamFightTimes.push(Math.round(teamfights[i].start / 60))
            teamFightY.push(0)
            var teamFightPlayers = teamfights[i].players
            var currentDeathStr = "Deaths";
            for (var j = 0; j < teamFightPlayers.length;j++) {
                //For Each player in the game, check if they died in each fight, if they did, add them to an array
                if (teamFightPlayers[j].deaths > 0) {
                    currentDeathStr = currentDeathStr + "<br>" + playersData[j].hero_id
                    }
            }
        teamFightLabel.push(currentDeathStr)
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
        var trace3 = {
            x: teamFightTimes,
            y: teamFightY,
            mode: "markers",
            type:'scatter',
            name: "Team Fights",
            visible: 'legendonly',
            text: teamFightLabel,
            marker: {
                color: "#000000"
            }

        }

        // if (isRadiant) {
        //     var topText = radiantInfo.team.toUpperCase()
        //     var bottomText = direInfo.team.toUpperCase()
        //     var topColor = radiantInfo.color
        //     var bottomColor = direInfo.color
        // } else {
        //     var topText = direInfo.team.toUpperCase()
        //     var bottomText = radiantInfo.team.toUpperCase()
        //     var topColor = direInfo.color
        //     var bottomColor = radiantInfo.color
        // }
        // var trace3 = {
        //     x: [0.3],
        //     y: [0],
        //     mode:"text",
        //     text: [bottomText],
        //     textposition:"bottom-right",
        //     textfont: {
        //         family: "sans-serif",
        //         color: bottomColor,
        //         size: 32
        //     }
        // }
        // var trace4 = {
        //     x: [0.3],
        //     y: [0],
        //     mode:"text",
        //     text: [topText],
        //     textposition:"top-right",
        //     textfont: {
        //         family: "sans-serif",
        //         color: topColor,
        //         size: 32
        //     }

        // }
        //Make the Graph
        var data = [trace1, trace2,trace3]
        var layout = {
            xaxis:{
                title: "Minutes"
            },
            yaxis: {
                range:[maxDiff * -1 ,maxDiff]
            }
        }
        Plotly.newPlot('goldAdv', data,layout)
        console.log("Graph Drawn")
    })
}
//gameAdvantageGraph(6214721378, myID)