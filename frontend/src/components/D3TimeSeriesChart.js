import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

const D3TimeSeriesChart = ({ data, width = 800, height = 400, title }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const parseDate = d3.timeParse('%Y-%m-%d');
    const formattedData = data.map(d => ({
      ...d,
      date: parseDate(d.date),
      totalTime: +d.totalTime
    }));

    const xScale = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.date))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.totalTime)])
      .nice()
      .range([innerHeight, 0]);

    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.totalTime))
      .curve(d3.curveMonotoneX);

    const area = d3.area()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.totalTime))
      .curve(d3.curveMonotoneX);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select(svgRef.current.parentNode)
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('opacity', 0);

    g.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', 0).attr('y2', 0)
      .selectAll('stop')
      .data([
        { offset: '0%', color: 'rgba(25, 118, 210, 0.1)' },
        { offset: '100%', color: 'rgba(25, 118, 210, 0.4)' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    g.append('path')
      .datum(formattedData)
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', 'url(#area-gradient)');

    g.append('path')
      .datum(formattedData)
      .attr('class', 'line')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', '#1976d2')
      .style('stroke-width', 2);

    const dots = g.selectAll('.dot')
      .data(formattedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.totalTime))
      .attr('r', 4)
      .style('fill', '#1976d2')
      .style('stroke', '#fff')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 6);
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`
          <strong>Date:</strong> ${d3.timeFormat('%B %d, %Y')(d.date)}<br/>
          <strong>Study Time:</strong> ${Math.floor(d.totalTime / 60)}h ${d.totalTime % 60}m<br/>
          <strong>Sessions:</strong> ${d.sessionCount}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        d3.select(this).attr('r', 4);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickFormat(d => `${Math.floor(d / 60)}h`));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Study Time');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Date');

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

export default D3TimeSeriesChart;