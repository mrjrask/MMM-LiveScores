Module.register("MMM-LiveScores", {
    defaults: {
        updateInterval: 3 * 60 * 1000, // 3 minutes
        leagues: ["MLB", "NFL", "NBA", "NHL"],
        showLogos: true,
        retainFinalScoresUntil: "09:00" // Scores retained until 9 am the next morning
    },

    start: function() {
        this.scores = null;
        this.scheduleUpdate();
    },

    scheduleUpdate: function() {
        const self = this;
        setInterval(function() {
            self.getScores();
        }, this.config.updateInterval);
        this.getScores(); // Initial fetch
    },

    getScores: function() {
        this.sendSocketNotification("GET_SCORES", this.config);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "SCORES_RESULT") {
            this.scores = payload;
            this.updateDom();
        }
    },

    getDom: function() {
        const wrapper = document.createElement("div");

        if (!this.scores) {
            wrapper.innerHTML = "Loading scores...";
            return wrapper;
        }

        this.scores.forEach((game) => {
            const gameDiv = document.createElement("div");
            gameDiv.className = "game";

            if (this.config.showLogos && game.homeLogo && game.awayLogo) {
                const homeLogo = document.createElement("img");
                homeLogo.src = game.homeLogo;
                homeLogo.className = "team-logo";
                gameDiv.appendChild(homeLogo);

                const awayLogo = document.createElement("img");
                awayLogo.src = game.awayLogo;
                awayLogo.className = "team-logo";
                gameDiv.appendChild(awayLogo);
            }

            const gameInfo = document.createElement("div");
            gameInfo.className = "game-info";
            gameInfo.innerHTML = `${game.homeTeam} vs ${game.awayTeam}: ${game.homeScore} - ${game.awayScore} (${game.status})`;
            gameDiv.appendChild(gameInfo);

            wrapper.appendChild(gameDiv);
        });

        return wrapper;
    }
});
