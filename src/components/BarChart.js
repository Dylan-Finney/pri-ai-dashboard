import * as d3 from "d3"
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/horizontal-bar-chart
export default function BarChart(data, {
    x = d => d, // given d in data, returns the (quantitative) x-value
    y = (d, i) => i, // given d in data, returns the (ordinal) y-value
    title, // given d in data, returns the title text
    marginTop = 30, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 10, // the bottom margin, in pixels
    marginLeft = 30, // the left margin, in pixels
    width = 640, // the outer width of the chart, in pixels
    height, // outer height, in pixels
    xType = d3.scaleLinear, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    xFormat, // a format specifier string for the x-axis
    xLabel, // a label for the x-axis
    yPadding = 0.1, // amount of y-range to reserve to separate bars
    yDomain, // an array of (ordinal) y-values
    yRange, // [top, bottom]
    color = "currentColor", // bar fill color
    titleColor = "black", // title fill color when atop bar
    titleAltColor = "currentColor", // title fill color when atop background
  } = {},svgRef) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const R = d3.map(data, (d) => d.raw);
  
    // Compute default domains, and unique the y-domain.
    if (xDomain === undefined) xDomain = [0, d3.max(X)];
    if (yDomain === undefined) yDomain = Y;
    yDomain = new d3.InternSet(yDomain);
  
    // Omit any data not present in the y-domain.
    const I = d3.range(X.length).filter(i => yDomain.has(Y[i]));
  
    // Compute the default height.
    if (height === undefined) height = Math.ceil((yDomain.size + yPadding) * 25) + marginTop + marginBottom;
    if (yRange === undefined) yRange = [marginTop, height - marginBottom];
  
    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = d3.scaleBand(yDomain, yRange).padding(yPadding);
    const xAxis = d3.axisTop(xScale).ticks(width / 80, xFormat);
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(10);
  
    // Compute titles.
    if (title === undefined) {
      const formatValue = xScale.tickFormat(100, xFormat);
      title = i => `${formatValue(X[i])}`;
    } else {
      const O = d3.map(data, d => d);
      const T = title;
      title = i => T(O[i], i, data);
    }
  
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(xAxis)
        .attr("font-family", "Inter")
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", height - marginTop - marginBottom)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - marginRight)
            .attr("y", -22)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .attr("font-family", "Inter")
            .text(xLabel)
            .attr("font-family", "Inter"));
  
    svg.append("g")
        .attr("fill", "#15B79E")
      .selectAll("rect")
      .data(I)
      .join("rect")
        .attr("x", xScale(0))
        .attr("y", i => yScale(Y[i]))
        .attr("width", i => xScale(X[i]) - xScale(0))
        .attr("height", yScale.bandwidth())
        .on('mouseenter', function (actual, i) {
          console.log(X[i])
          svg.selectAll("g").selectAll("rect").transition().attr("opacity", 0.3)
          svg.selectAll(".value").transition().attr("opacity", (label,index) => label === i ? 1 : 0.7).attr("font-weight", (label,index) => label === i ? "bold" :  "normal")
          svg.selectAll(".title").selectAll("text").transition().attr("opacity", (label,index) => Y[i] === label ? 1 :  0.3).attr("font-weight", (label,index) => Y[i] === label ? "bold" :  "normal")
          d3.select(this).transition().attr("opacity", 1)
        })
        .on('mouseleave', function (actual, i) {
          svg.selectAll(".title").selectAll("text").transition().attr("opacity", 1 ).attr("font-weight", "normal")
          svg.selectAll(".value").attr("opacity", 1).transition().attr("font-weight", "normal")
          svg.selectAll("g").selectAll("rect").transition().attr("opacity", 1)
        })
        .append("title")
          .text((d,i,x) => R[i] ? `${Y[i]} - ${R[i]} (${(X[i]*100).toFixed(2)}%)` : `${Y[i]} - ${(X[i]*100).toFixed(2)}%`);
       
    svg.append("g")
        .attr("fill", titleColor)
        .attr("text-anchor", "end")
        .attr("font-size", 10)
        .attr("font-family", "Inter")
      .selectAll("text")
      .data(I)
      .join("text")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("class", "value")
        .attr("dx", -4)
        .text(title)
        .call(text => text.filter(i => xScale(X[i]) - xScale(0) < 20) // short bars
            .attr("dx", +4)
            .attr("fill", titleAltColor)
            .attr("text-anchor", "start")
            .attr("font-family", "Inter"));
            
  
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .attr("class", "title")
        .attr("font-family", "Inter");
  
    return svg.node();
  }