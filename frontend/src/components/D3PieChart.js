import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const D3PieChart = ({ data, width = 400, height = 400, title }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 20;
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie()
      .value(d => d.totalTime)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const tooltip = d3.select(svgRef.current.parentNode)
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('opacity', 0);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .style('fill', (d, i) => d.data.subject?.color || colors(i))
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 10)
          );
        
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        
        const percentage = ((d.data.totalTime / d3.sum(data, d => d.totalTime)) * 100).toFixed(1);
        tooltip.html(`
          <strong>${d.data.subject?.name || d.data.name}</strong><br/>
          <strong>Time:</strong> ${Math.floor(d.data.totalTime / 60)}h ${d.data.totalTime % 60}m<br/>
          <strong>Percentage:</strong> ${percentage}%<br/>
          <strong>Sessions:</strong> ${d.data.sessionCount || 0}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => {
        const percentage = ((d.data.totalTime / d3.sum(data, d => d.totalTime)) * 100);
        return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
      });

    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${radius + 20}, ${-radius / 2})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', (d, i) => d.subject?.color || colors(i));

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 7.5)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text(d => d.subject?.name || d.name);

    return () => {
      tooltip.remove();
    };
  }, [data, width, height]);

  return (
    <Box sx={{ position: 'relative', overflow: 'visible' }}>
      <svg ref={svgRef} className="d3-chart" />
    </Box>
  );
};

export default D3PieChart;