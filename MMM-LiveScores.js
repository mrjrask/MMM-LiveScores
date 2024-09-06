Module.register("MMM-LiveScores", {
    defaults: {
        updateInterval: 3 * 60 * 1000, // 3 minutes
        leagues: ["MLB", "NFL", "NBA", "NHL"],
        showLogos: true,
        retainFinalScoresUntil: "09:00"
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

        // Loop through scores and create elements for each
        this.scores.forEach((game) => {
            const gameDiv = document.createElement("div");
            gameDiv.className = "game";
            gameDiv.innerHTML = `${game.homeTeam} vs ${game.awayTeam}: ${game.homeScore} - ${game.awayScore}`;
            wrapper.appendChild(gameDiv);
        });

        return wrapper;
    }
});
