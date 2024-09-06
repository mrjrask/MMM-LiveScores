# MMM-LiveScores

A Magic Mirror module that shows live sports scores for MLB, NFL, NBA, and NHL. 

## Installation

1. Clone the repository into the `modules` folder of your MagicMirror installation:
2. Navigate into the folder and install dependencies:
3. 3. Configure the module in your `config.js` file:
```js
{
    module: "MMM-LiveScores",
    position: "top_left",
    config: {
        updateInterval: 180000, // 3 minutes
        leagues: ["MLB", "NFL", "NBA", "NHL"],
        showLogos: true
    }
}
