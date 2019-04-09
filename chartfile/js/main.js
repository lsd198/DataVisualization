// A reusable scatterplot to explore data collected from the India 2001 nationwide census

$(function() {
    // Read in the data
    d3.csv('data/all.csv', function(error, data) {

        /* ********************************** Initial setup ********************************** */
        var margin = {
            top: 50,
            right: 50,
            bottom: 100,
            left: 70
        };

        // Height and Width of the chart
        var height = 600 - margin.bottom - margin.top;
        var width = 800 - margin.left - margin.right;

        // Append a wrapper svg and g for the chart
        var svg = d3.select('#vis')
        .append("svg")
        .attr('height', 600)
        .attr('width', 800)
        .style("left", margin.left + "px")
        .style("top", margin.top + "px");

        var g = svg.append('g')
        .attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
        .attr('height', height)
        .attr('width', width);

        // Global Variables
        // Scales
        var xScale = d3.scaleLinear();
        var yScale = d3.scaleLinear();
        var rScale = d3.scaleLinear();

        // What features to display
        var xVariable = 'Males';
        var yVariable = 'Females';
        var selectedStates = [];
        var selectedData = data;

        // X and Y axes
        var xAxis = d3.axisBottom();
        var yAxis = d3.axisLeft();

        // Keys which can be represented as a scatterplot, and don't have NAs
        var keys = ["Persons","Males","Females","Growth..1991...2001.","Number.of.households","Household.size..per.household.","Sex.ratio..females.per.1000.males.","Sex.ratio..0.6.years.","Scheduled.Tribe.population","Percentage.to.total.population..ST.","Persons..literate","Males..Literate","Females..Literate","Persons..literacy.rate","Males..Literatacy.Rate","Females..Literacy.Rate","Total.Educated","Data.without.level","Below.Primary","Primary","Middle","Matric.Higher.Secondary.Diploma","Graduate.and.Above","X0...4.years","X5...14.years","X15...59.years","X60.years.and.above..Incl..A.N.S..","Total.workers","Main.workers","Marginal.workers","Non.workers", "Total.Inhabited.Villages","Drinking.water.facilities","Safe.Drinking.water","Electricity..Power.Supply.","Electricity..domestic.","Electricity..Agriculture.","Primary.school","Middle.schools","Secondary.Sr.Secondary.schools","College","Medical.facility","Primary.Health.Centre","Primary.Health.Sub.Centre","Post..telegraph.and.telephone.facility","Bus.services","Paved.approach.road","Mud.approach.road","Permanent.House","Semi.permanent.House","Temporary.House"];

        // Hand picked contrasting colors to represent each state
        var stateColors = ["#FF00FF", "#FF7F50", "#DC143C", "#003366", "#669999", "#339933", "#003300", "#666633", "#996633", "#ff9900",
                           "#ff5050", "#660033", "#990099", "#660066", "#9900ff", "#6600ff", "#0099ff", "#00ffcc", "#66ff99", "#ffff66",
                           "#ff9966", "#ffff99", "#ff99cc", "#66ccff", "#cc9900", "#cc6600", "#ffcc99", "#cc99ff", "#ff99cc", "#ccff66",
                           "#99ff99", "#669900", "#00ffff", "#99cc00", "#0066cc"];
        /* ********************************** Process data  ********************************** */
        // Get Unique states
        var states = [];
        data.forEach( function(d) {
            if (!states.includes(d.State)) {
                states.push(d.State);
            }
        });
        selectedStates = states;

        // function for filtering data based on selected states
        function filterData() {
            // Select data for the states that are selected and data that isn't blank or NA
            selectedData = data.filter(function(d) {
                return selectedStates.indexOf(d.State) > -1 && !(isNaN((d[xVariable]))) && !(isNaN((d[yVariable])));
            });
        }
        /* ********************************** Create scales  ********************************** */
        var setScales = function() {
            
            // Find minimum and maximum values, then define linear scales for x, y and radius
            var xMax = d3.max(selectedData, function(d) { return +d[xVariable]})*1.05;
            var xMin = d3.min(selectedData, function(d) {return +d[xVariable]})*.85;
            xScale.range([0, width]).domain([xMin, xMax]);
            
            var yMin =d3.min(selectedData, function(d) {return +d[yVariable]})*.9;
            var yMax =d3.max(selectedData, function(d) {return +d[yVariable]})*1.05;
            yScale.range([height, 0]).domain([yMin, yMax]);

            var rMin =d3.min(data, function(d) {return +d.Persons})*.9;
            var rMax =d3.max(data, function(d) {return +d.Persons})*1.05;
            rScale.range([5, 25]).domain([rMin, rMax]);
        };

        var stateScale = d3.scaleOrdinal().range(stateColors).domain(states);

        /* ********************************** Create Axes  ********************************** */
        var setAxes = function() {
            d3.selectAll('.axis').remove();
            d3.selectAll('.title').remove();
            
            xAxis.scale(xScale)
                .ticks(5, 's');

            yAxis.scale(yScale)
                .tickFormat(d3.format('.2s'));


            /* ********************************** Create Axis and labels  ********************************** */
            // X-Axis label
            var xAxisLabel = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
            .attr('class', 'axis')
            .transition().duration(1000)
            .call(xAxis);

            // Y-Axis label
            var yAxisLabel = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')')
            .transition().duration(1000)
            .call(yAxis);

            // Text for X-Axis label
            var xAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left + width / 2) + ',' + (height + margin.top + 40) + ')')
            .attr('class', 'title');

            // Text for Y-Axis label
            var yAxisText = svg.append('text')
            .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height / 2) + ') rotate(-90)')
            .attr('class', 'title');

            xAxisText.text(xVariable);
            yAxisText.text(yVariable);
        };

        /* ********************************** Bind data and Draw visualization  ********************************** */
        // Set up tooltip to show State on hover
        var tooltip = d3.select("circle")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("");
        
        var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {return d.State;});
        g.call(tip);

        var draw = function(data) {
            setScales();
            setAxes();

            // Select all circles and bind data
            var circles = g.selectAll('circle').data(data);

            // New Values
            circles.enter()
                .append('circle')
                .attr('r', function(d) {return rScale(d.Persons);})
                .attr('fill', function(d) {return stateScale(d.State)})
                .attr('cy', height)
                .attr('stroke', 'black')
                .style('opacity', .3)
                .attr('cx', function(d) { return xScale(d[xVariable]);})
                .attr('title', function(d) {return d['District']})
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
            // Updated values
                .merge(circles)
                .attr('fill', function(d) {return stateScale(d.State)})
                .transition()
                .duration(600)
                .delay(function(d){return xScale(d[xVariable]) * 5})
                .attr('cx', function(d) { return xScale(d[xVariable]);})
                .attr('cy', function(d) { return yScale(d[yVariable])});
            // Removing values
            circles.exit()
                .transition()
                .duration(1500)
                .attr('cx', width)
                .attr('cy', height)
                .attr('opacity', 0.0)
                .remove();
        };

        // Draw visualization for the first time
        draw(data);

        /* ********************************** Variable selectors  ********************************** */
        // X - Variable
        // Create a variable selector    
        var xSelector = $('#xControl');

        // Fill in options
        keys.forEach(function(d) {
            var newOption = new Option(d, d);
            xSelector.append(newOption);
        });
        // Set X-axis variable
        xSelector.val(xSelector);

        
        // Y - Variable
        // Create a variable selector    
        var ySelector = $('#yControl');

        // Fill in options
        keys.forEach(function(d) {
            var newOption = new Option(d, d);
            ySelector.append(newOption);
        });
        // Set Y-axis variable
        ySelector.val(ySelector);


        // Select States
        // Create a variable selector    
        var stateSelector = $('#stateControl');
        // Fill in options
        states.forEach(function(d) {
            var newOption = new Option(d, d);
            stateSelector.append(newOption);
        });

        // Set State
        stateSelector.val(stateSelector);

        /* ********************************** Listen for input  ********************************** */
        // Listen for input on the xVariable Control
        $("#xControl").on('change', function() {
            // Get the selected value
            xVariable = $("#xControl option:selected").val();
            // Redraw visualization
            filterData();
            draw(selectedData);
        });

        // Listen for input on the yVariable Control
        $("#yControl").on('change', function() {
            // Get the selected value
            yVariable = $("#yControl option:selected").val();
            // Redraw visualization
            filterData();
            draw(selectedData);
        });

        // event listener for state selector change
        stateSelector.change(function() {
            // Reset selected countries
            selectedStates = [];

            // Get selected countries from selector
            $('#stateControl option:selected').each(function() {
                selectedStates.push($(this).text());
            });

            // Filter and draw data for the selected states
            filterData();
            draw(selectedData);
        });
    });
});