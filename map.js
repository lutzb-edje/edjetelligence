
    //Width and height of map
    var width = 960;
    var height = 500;

    var active = d3.select(null);
    var zoom = d3.behavior.zoom()
            .translate([0, 0])
            .scale(1)
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

    // D3 Projection
    var projection = d3.geo.albersUsa()
            .translate([width / 2, height / 2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US

    // Define path generator
    var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
            .projection(projection);  // tell path generator to use albersUsa projection


    // Define linear scale for output
    var color = d3.scale.linear()
            .range(["rgb(88,88,88)", "rgb(134,166,77)", "rgb(165,210,71)", "rgb(165,245,29)"]);


    var legendText = ["Lots of EDJErs", "Some EDJErs", "Few EDJErs", "None"];



    //Create SVG element and append map to the SVG
    var svg = d3.select("#map")
            .append("svg")
            // .attr("width", width)
            // .attr("height", height)
            .attr("viewBox", [0, 0, width, height])

    var g = svg.append("g");

    // Append Div for tooltip to SVG
    var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    // Load in states data!
    d3.csv("states.csv", function (data) {
      color.domain([0, 1, 2, 3]); // setting the range of the input data

      // Load GeoJSON data and merge with states data
      d3.json("us-states.json", function (json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

          // Grab State Name
          var dataState = data[i].state;

          // Grab data value
          var dataValue = data[i].edjers;

          // Find the corresponding state inside the GeoJSON
          for (var j = 0; j < json.features.length; j++) {
            var jsonState = json.features[j].properties.name;

            if (dataState == jsonState) {

              // Copy the data value into the JSON
              json.features[j].properties.edjers = dataValue;

              // Stop looking through the JSON
              break;
            }
          }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature

        g.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                //.on("click", clicked)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function (d) {

                  // Get data value
                  var value = d.properties.edjers;

                  if (value) {
                    if (value > 50) return color(3);
                    if (value >= 10) return color(2);
                    if (value > 0) return color(1);
                  }
                  //If value is undefined???
                  return color(0);
                })
                .on("mouseover", function (d) {
                  div.transition()
                          .duration(200)
                          .style("opacity", .9);
                  div.text(d.properties.name + ' ' + (d.properties.edjers || 0))
                          .style("left", (d3.event.pageX) + "px")
                          .style("top", (d3.event.pageY - 28) + "px");
                })
                // fade out tooltip on mouse out
                .on("mouseout", function (d) {
                  div.transition()
                          .duration(500)
                          .style("opacity", 0);
                });


        // Map the locations
        d3.csv("client-locations.csv", function (data) {

          g.selectAll("circle")
                  .data(data)
                  .enter()
                  .append("circle")
                  .attr("cx", function (d) {
                    return projection([d.lon, d.lat])[0];
                  })
                  .attr("cy", function (d) {
                    return projection([d.lon, d.lat])[1];
                  })
                  .attr("r", function (d) {
                    if (d.edjers) {
                      var half = d.edjers / 2;
                      if (half < 3) return 3;
                      if (half > 15) return 15;
                      return half;
                    }
                    return 3;
                  })
                  //.style("fill", "rgb(217,91,67)")
                  .style("fill", function (d) {
                    if (d.edjers > 0) {
                      if (d.edjers < 5) return "rgb(153,153,0)";
                      if (d.edjers > 10) return "rgb(200,0,0)";
                      return "rgb(200,100,0)";
                    }
                    return "rgb(0,76,153)";
                  })
                  .style("opacity", 0.85)

                  // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
                  // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
                  .on("mouseover", function (d) {
                    div.transition()
                            .duration(200)
                            .style("opacity", .9);
                    div.text(d.place + " " + (d.edjers || 0))
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                  })

                  // fade out tooltip on mouse out
                  .on("mouseout", function (d) {
                    div.transition()
                            .duration(500)
                            .style("opacity", 0);
                  });
        });

        // // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        // var legend = d3.select("body").append("svg")
        // 	.attr("class", "legend")
        // 	.attr("width", 140)
        // 	.attr("height", 200)
        // 	.selectAll("g")
        // 	.data(color.domain().slice().reverse())
        // 	.enter()
        // 	.append("g")
        // 	.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        // legend.append("rect")
        // 	.attr("width", 18)
        // 	.attr("height", 18)
        // 	.style("fill", color);

        // legend.append("text")
        // 	.data(legendText)
        // 	.attr("x", 24)
        // 	.attr("y", 9)
        // 	.attr("dy", ".35em")
        // 	.text(function (d) { return d; });
      });

    });


    svg.call(zoom).call(zoom.event);


    function clicked(d) {
      if (active.node() === this) return reset();
      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      var bounds = path.bounds(d),
              dx = bounds[1][0] - bounds[0][0],
              dy = bounds[1][1] - bounds[0][1],
              x = (bounds[0][0] + bounds[1][0]) / 2,
              y = (bounds[0][1] + bounds[1][1]) / 2,
              scale = Math.max(1, Math.min(8, 0.85 / Math.max(dx / width, dy / height))),
              translate = [width / 2 - scale * x, height / 2 - scale * y];

      svg.transition()
              .duration(750)
              .call(zoom.translate(translate).scale(scale).event);
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      svg.transition()
              .duration(750)
              .call(zoom.translate([0, 0]).scale(1).event);
    }

    function zoomed() {
      g.style("stroke-width", 1.5 / d3.event.scale + "px");
      g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // If the drag behavior prevents the default click,
    // also stop propagation so we don???t click-to-zoom.
    function stopped() {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }