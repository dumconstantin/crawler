

$.get('/data.json', x => {

  let svg = $('svg').attr('width', $(window).width()).attr('height', $(window).height())

  var graph = {
    nodes: [],
    links: []
  }

  x.urls.forEach((y, i) => {
    let group
    if (i === 0) {
      group = 1
    } else {
      group = 2
    }

    graph.nodes.push({
      id: y,
      group: group
    })
  })

  x.relations.forEach(y => {
    graph.links.push({
      source: x.urls[y[0]],
      target: x.urls[y[1]],
      value: 1
    })
  })

  createGraph(graph)
})


function createGraph(graph) {

  let svg = d3.select('svg'),
      width = +svg.attr('width'),
      height = +svg.attr('height')

  let color = d3.scaleOrdinal(d3.schemeCategory20)

  let simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d) { return d.id }))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))

  let link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter().append('line')
    .attr('stroke-width', function(d) { return Math.sqrt(d.value) })

  let drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)

  let node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graph.nodes)
    .enter().append('circle')
    .attr('r', 5)
    .attr('fill', function(d) { return color(d.group) })
    .call(drag)

    node
      .append('title')
      .text(function(d) { return d.id })

    node
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip)

   let tooltip = svg
     .append('g')
     .attr('class', 'tooltip')

    let tooltipText = tooltip
      .append('text')

  simulation
    .nodes(graph.nodes)
    .on('tick', ticked)

  simulation.force('link')
    .links(graph.links)


  function showTooltip(node) {
    tooltipText
      .text(node.id)

    tooltipText
      .text(node.id)
      .attr('x', function () {
       return node.x - this.getComputedTextLength() / 2
      })
      .attr('y', node.y - 100)
  }

  function hideTooltip(node) {
    tooltipText.text('')
  }

  function ticked() {
    link
      .attr('x1', function(d) { return d.source.x })
      .attr('y1', function(d) { return d.source.y })
      .attr('x2', function(d) { return d.target.x })
      .attr('y2', function(d) { return d.target.y })

    node
      .attr('cx', function(d) { return d.x })
      .attr('cy', function(d) { return d.y })
  }

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


}

