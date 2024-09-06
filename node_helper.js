const NodeHelper = require("node_helper");
const request = require("request");
const moment = require("moment");

module.exports = NodeHelper.create({
    finalScores: [],
    start: function() {
        console.log("MMM-LiveScores helper started...");
    },

    socketNotificationReceived: function(notification, config) {
        if (notification === "GET_SCORES") {
            this.getSportsScores(config);
        }
    },

    getSportsScores: function(config) {
        const currentTime = moment();
        const targetTime = moment().hour(9).minute(0);

        // If before 9am, return the stored final scores
        if (currentTime.isBefore(targetTime)) {
            this.sendSocketNotification("SCORES_RESULT", this.finalScores);
            return;
        }

        this.finalScores = []; // Clear final scores after 9am
        const self = this;
        const leagueEndpoints = {
            MLB: "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
            NFL: "http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
            NBA: "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
            NHL: "http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard"
        };

        let scores = [];

        config.leagues.forEach((league) => {
            const endpoint = leagueEndpoints[league];
            request(endpoint, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    const data = JSON.parse(body);
                    const games = self.parseScores(data);
                    scores = scores.concat(games);

                    // If the game is final, add it to the finalScores array
                    games.forEach(game => {
                        if (game.status.toLowerCase() === "final") {
                            self.finalScores.push(game);
                        }
                    });

                    if (scores.length >= config.leagues.length) {
                        self.sendSocketNotification("SCORES_RESULT", scores);
                    }
                } else {
                    console.error("Error fetching scores:", error);
                }
            });
        });
    },

    parseScores: function(data) {
        const games = data.events.map((game) => {
            return {
                homeTeam: game.competitions[0].competitors[0].team.shortDisplayName,
                awayTeam: game.competitions[0].competitors[1].team.shortDisplayName,
                homeScore: game.competitions[0].competitors[0].score,
                awayScore: game.competitions[0].competitors[1].score,
                homeLogo: game.competitions[0].competitors[0].team.logo,
                awayLogo: game.competitions[0].competitors[1].team.logo,
                status: game.status.type.description
            };
        });
        return games;
    }
});
