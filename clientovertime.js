fetch("clientCountsFlat.json")
    .then(response => response.json())
    .then(json => {
        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("clientsovertime", am4charts.XYChart);
            chart.colors.step = 1;
            chart.data = json;


            // Create axes
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "Date";
            categoryAxis.title.text = "Date";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 20;
            categoryAxis.startLocation = 0.5;
            categoryAxis.endLocation = 0.5;
            categoryAxis.renderer.labels.template.rotation = -90;

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.title.text = "EDJErs";

            // Create series
            const clients = json[0];
            for (const client in clients) {
                if (client === "Date" || client === "EDJErs") continue;
                //console.log(`${client}: ${clients[client]}`);

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = client;
                //series.dataFields.valueYShow = "totalPercent";
                series.dataFields.categoryX = "Date";
                series.name = client;
                series.tooltipText = "{name} {valueY}";
                series.tooltip.label.adapter.add("text", function (text, target) {
                    if (target.dataItem && target.dataItem.valueY == 0) {
                        return "";
                    }
                    else {
                        return text;
                    }
                });

                series.fillOpacity = 0.85;
                series.stacked = true;

            }

            var series2 = chart.series.push(new am4charts.LineSeries());
            series2.name = "EDEJrs";
            series2.stroke = am4core.color("#CDA2AB");
            series2.strokeWidth = 3;
            series2.dataFields.valueY = "EDJErs";
            series2.dataFields.categoryX = "Date";
            // Add cursor
            chart.cursor = new am4charts.XYCursor();

        }); // end am4core.ready()
    });