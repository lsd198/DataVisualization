import {
  select,
  csv,
  scaleBand,
  scalePoint,
  scaleOrdinal,
  schemeCategory10,
  extent,
  axisLeft,
  axisBottom,
  format,
  forceSimulation
} from 'd3';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');


const render = nodes => {
  const title = 'Scatterplot';
  
  const xValue = d => d.AFRPN;
  const xAxisLabel = 'Action';
  
  const yValue = d => d.Type;
  const circleRadius = d => Math.sqrt(d.Strength)*0.001;
  const yAxisLabel = 'Fact';
  
  const margin = { top: 40, right: 40, bottom: 40, left: 150 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const color = scaleOrdinal()
    .domain(nodes.map(d => d.Type))
    .range(schemeCategory10);
  
  const xScale = scalePoint()
    .domain(nodes.map(xValue))
    .range([0, innerWidth])
    .padding(0.5);
  
  const yScale = scalePoint()
    .domain(nodes.map(yValue))
    .range([0, innerHeight])
    .padding(0.5);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const xAxis = axisBottom(xScale)
    .tickSize(-innerHeight);
  
  const yAxis = axisLeft(yScale)
    .tickSize(-innerWidth);
  
  const yAxisG = g.append('g').call(yAxis);
  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);
  
  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(1))
    .force("collision", d3.forceCollide().radius(d => circleRadius(d)))
	  .force('x', d3.forceX().x(d => xScale(xValue(d))))
    .force('y', d3.forceY().y(d => yScale(yValue(d))))
		.on('tick', ticked);
  
  function ticked() {
  
    const circle = g.selectAll('circle').data(nodes);
    
      circle.enter().append('circle')
        .attr('r', d => circleRadius(d))
        .attr('fill', d => color(d.Type))
    		.attr('cx', d => xScale(xValue(d)))
    		.attr('cy', d => yScale(yValue(d)))
      .merge(circle)
        .attr('cx', function(d) { return d.x })
        .attr('cy', function(d) { return d.y })
    		.call(drag(simulation));
    
    	circle.append("title")
    	  .text(d => d.Type + " " + d.Strength);
  }

  
  
const drag = simulation => {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}  
  
  
};


csv('data.csv')
  .then(nodes => {
//  	console.log(nodes);
  
    nodes.forEach(d => {
 			d.Strength = +d.Strength
    });
    render(nodes);
  });