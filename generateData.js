module.exports = {
    "series.id*.score.total": function (data, totalKey) {
        const seriesKey = totalKey.slice(0, totalKey.indexOf(".score.total"));

        let total = 0;
        for (const [key, value] of data) {
            if (key.startsWith(`${seriesKey}.score.`)) {
                total += value;
            }
        }

        return total;
    },
}