const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-LiveScores helper started...");
    },

    socketNotificationReceived: function(notification, config) {
        if (notification === "GET_SCORES") {
            this.getSportsScores(config);
        }
    },

    getSportsScores: function(config) {
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
                status: game.status.type.description
            };
        });
        return games;
    }
});
