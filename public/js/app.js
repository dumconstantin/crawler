
var socket = io()

$('form').on('submit', e => {
  e.preventDefault()

  let url = $('input[name="start-url"]').val()

  socket.emit('start-url', url)

})

socket.on('data', x => {
  let crawled = x.crawled.length

  let urls = x.urls.reduce((acc, y) => {

    if (x.props[y].type === 'html') {
      acc.count += 1
    } else {
      acc.static += 1
    }

    if (x.props[y].inbound === true) {
      acc.inbound += 1
    } else {
      acc.outbound += 1
    }

    return acc
  }, {
    count: 0,
    static: 0,
    inbound: 0,
    outbound: 0
  })

  urls.crawled = x.crawled.length
  urls.remaining = urls.count - urls.crawled

  Object.keys(urls).forEach(y => {
    $(`[data-id="${y}"]`).text(urls[y])
  })

})

socket.on('error', x => {
  console.error(x)
  alert(x)
})

socket.on('data', x => {

  let svg = $('svg')

  let w = svg.parent().width()
  let h = svg.parent().height()

  svg.attr('width', w).attr('height', h)

  var graph = {
    nodes: [],
    links: []
  }

  x.urls.forEach((y, i) => {
    let prop = x.props[y]
    let group
    if (i === 0) {
      group = 1
    } else if (prop.inbound === true) {
      group = 2
    } else {
      group = 3
    }

    graph.nodes.push({
      id: y,
      group: group,
      type: prop.type
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

  svg.selectAll("*").remove()

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
    .attr('class', d => `group-${d.group}`)
    .call(drag)

    let tooltipContainer = svg
      .append('g')
      .attr('class', 'tooltip')

    let tooltipBg = tooltipContainer
      .append('rect')

    let tooltip = tooltipContainer
      .append('text')

    node
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip)

  function showTooltip(node) {

    tooltip.text(node.type + ' - ' + node.id)

    let box = tooltip.node().getBBox()

    let x = node.x - box.width / 2
    let y = node.y - 30

    tooltip
      .attr('x', x)
      .attr('y', y)

    tooltipBg
      .attr('x', x - 10)
      .attr('y', y - 20)
      .attr('width', box.width + 20)
      .attr('height', box.height + 15)
  }

  function hideTooltip(node) {
    tooltip.text('')
    tooltipBg.attr('width', 0)
  }

  simulation
    .nodes(graph.nodes)
    .on('tick', ticked)

  simulation.force('link')
    .links(graph.links)

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

