import { 
  select, 
  csv, 
  scaleLinear, 
  max, 
  scaleBand, 
  axisLeft,
  axisBottom,
  format
} from 'd3';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = data => {
  const xValue = d => d.value; 
  const yValue = d => d.fname;
  const margin = { top: 20, right: 20, bottom: 20, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
   
  const xScale = scaleLinear()
    .domain([0, max(data, d => d.value)])
    .range([0, innerWidth]);
  
  const yScale = scaleBand()
    .domain(data.map(yValue))
    .range([0, innerHeight])
    .padding(0.4);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = axisBottom(xScale)
    .tickFormat(format('.3s'));
    
  
  g.append('g').call(axisLeft(yScale));
  g.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);
  
//  console.log(yScale.domain()); 
  
  g.selectAll('rect').data(data)
    .enter().append('rect')
      .attr('y', d => yScale(yValue(d)))
      .attr('width', d => xScale(xValue(d)))
      .attr('height', yScale.bandwidth());
};

csv('data.csv').then(data => {
  data.forEach(d => {
    d.value = +d.value * 1000000;
  });
//  console.log(data)
  render(data);
});
 