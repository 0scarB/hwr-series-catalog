// Arbeit von Oscar
// ----------------
const fs = require("fs");
const pug = require("pug");

function generate() {
    const data = JSON.parse(fs.readFileSync("./data.json", {encoding:"utf8", flag:"r"}));

    const completedData = completeData(data);

    fs.writeFileSync(
        "./static/index.html", 
        pug.compileFile("./templates/index.pug", {pretty: true})(completedData),
        {encoding: "utf8", flag: "w"},
    );

    for (const [showId, show] of Object.entries(completedData.shows)) {
        fs.writeFileSync(
            `./static/serien/${showId}.html`, 
            pug.compileFile("./templates/show.pug", {pretty: true})({
                ...show,
                id: showId,
            }),
            {encoding: "utf8", flag: "w"},
        );
    }
}

function completeData(data) {
    const completedData = {...data};

    for (const show of Object.values(completedData.shows)) {
        const scoreValues = Object.values(show.score);
        const scoresCount = scoreValues.length;
        const avgScore = show.score.totalScore / scoresCount;

        show.score.total = scoreValues.reduce((total, val) => total + val);
        show.score.avgRounded = Math.round(avgScore);
        show.score.maxTotal = scoresCount * 10;
    }

    return completedData;
}

generate();