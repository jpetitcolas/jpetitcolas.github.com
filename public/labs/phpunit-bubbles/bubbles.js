var chart = d3.chart.phpunitBubbles().padding(2);

d3.json("/labs/phpunit-bubbles/faker.json", function(err, data) {
    d3.select("#faker_report")
        .datum(data)
        .call(chart);
});
