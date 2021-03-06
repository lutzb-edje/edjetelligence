fetch("clientCounts.json")
    .then(response => response.json())
    .then(json => {

        am4core.ready(function () {

            // Themes begin
            am4core.useTheme(am4themes_animated);
            // Themes end

            var chart = am4core.create("clienthistory", am4charts.XYChart);
            chart.padding(40, 40, 40, 40);

            chart.numberFormatter.bigNumberPrefixes = [
                { "number": 1e+3, "suffix": "K" },
                { "number": 1e+6, "suffix": "M" },
                { "number": 1e+9, "suffix": "B" }
            ];

            var playButton;

            var slider;
            createSlider();

            var label = chart.plotContainer.createChild(am4core.Label);
            label.x = am4core.percent(97);
            label.y = am4core.percent(95);
            label.horizontalCenter = "right";
            label.verticalCenter = "middle";
            label.dx = -15;
            label.fontSize = 50;

            var stepDuration = 200;

            var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.dataFields.category = "Name";
            categoryAxis.renderer.minGridDistance = 1;
            categoryAxis.renderer.inversed = true;
            categoryAxis.renderer.grid.template.disabled = true;

            var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
            valueAxis.min = 0;
            valueAxis.rangeChangeEasing = am4core.ease.linear;
            valueAxis.rangeChangeDuration = 350;
            valueAxis.extraMax = 0;

            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.categoryY = "Name";
            series.dataFields.valueX = "Count";
            series.tooltipText = "{valueX.value}"
            series.columns.template.strokeOpacity = 0;
            series.columns.template.column.cornerRadiusBottomRight = 5;
            series.columns.template.column.cornerRadiusTopRight = 5;
            series.interpolationDuration = 350;
            series.interpolationEasing = am4core.ease.linear;

            // var labelBullet = series.bullets.push(new am4charts.LabelBullet())
            // labelBullet.label.horizontalCenter = "right";
            // labelBullet.label.text = "{values.valueX.workingValue.formatNumber('#')}";
            // labelBullet.label.textAlign = "end";
            // labelBullet.label.dx = -10;

            chart.zoomOutButton.disabled = true;

            // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
            series.columns.template.adapter.add("fill", function (fill, target) {
                return chart.colors.getIndex(target.dataItem.index);
            });

            function nextStep() {
                var dt = getTimeSlice();
                var newData = allData[getKey(dt)];
                var itemsWithNonZero = 0;
                for (var i = 0; i < chart.data.length; i++) {
                    chart.data[i].Count = newData[i].Count;
                    if (chart.data[i].Count > 0) {
                        itemsWithNonZero++;
                    }
                }

                chart.invalidateRawData();
                label.text = (dt.getMonth() + 1).toString() + '/' + dt.getFullYear().toString();
                categoryAxis.zoom({ start: 0, end: itemsWithNonZero / categoryAxis.dataItems.length });

            }
            function getKey(dt) {
                return dt.getFullYear().toString() + (dt.getMonth() + 1).toString().padStart(2, '0');
            }
            function getTimeSlice() {
                // var d1 = new Date(2007, 5, 1);
                // var d2 = new Date(2021, 9, 1);

                // var months;
                // months = (d2.getFullYear() - d1.getFullYear()) * 12;
                // months -= d1.getMonth();
                // months += d2.getMonth();
                // months = months <= 0 ? 0 : months;
                // 172 months of data in our file, find location based on %
                var t = Math.round(172 * slider.start);
                var dt = new Date("2007-05-05");
                dt.setMonth(dt.getMonth() + t);

                return dt;
            }
            categoryAxis.sortBySeries = series;

            allData = json;
            var key = getKey(new Date("2007-05-05"));
            chart.data = JSON.parse(JSON.stringify(allData[key]));
            categoryAxis.zoom({ start: 0, end: 1 / chart.data.length });

            function createSlider() {
                var sliderContainer = chart.createChild(am4core.Container);

                sliderContainer.width = am4core.percent(100);
                sliderContainer.valign = "bottom";
                sliderContainer.padding(0, 50, 25, 50);
                sliderContainer.layout = "horizontal";
                sliderContainer.height = 50;


                playButton = sliderContainer.createChild(am4core.PlayButton);
                playButton.valign = "middle";
                playButton.events.on("toggled", function (event) {
                    if (event.target.isActive) {
                        play();
                    }
                    else {
                        stop();
                    }
                })

                slider = sliderContainer.createChild(am4core.Slider);
                slider.valign = "middle";
                slider.margin(0, 0, 0, 0);
                slider.background.opacity = 0.3;
                slider.opacity = 0.7;
                slider.background.fill = am4core.color("#ffffff");
                slider.marginLeft = 30;
                slider.height = 15;
                slider.events.on("rangechanged", function () {
                    nextStep();
                });

                slider.startGrip.events.on("drag", function () {
                    stop();
                    sliderAnimation.setProgress(slider.start);
                });

                sliderAnimation = slider.animate({ property: "start", to: 1 }, 50000, am4core.ease.linear).pause();
                sliderAnimation.events.on("animationended", function () {
                    playButton.isActive = false;
                })
            }


            var sliderAnimation;

            function play() {
                if (slider) {
                    if (slider.start >= 1) {
                        slider.start = 0;
                        sliderAnimation.start();
                    }
                    sliderAnimation.resume();
                    playButton.isActive = true;
                }
            }

            function stop() {
                sliderAnimation.pause();
                playButton.isActive = false;
            }


        }); // end am4core.ready()
    });