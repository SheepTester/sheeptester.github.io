import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.8.5/+esm'
import {
  sankey as sankeyJustify,
  sankeyLinkHorizontal
} from 'https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/+esm'

export function sankey (container, data) {
  const svg = d3.create('svg')
  const sankey = sankeyJustify()
    .nodeId(d => d.name)
    .nodeWidth(15)
    .nodePadding(10)

  let link = svg
    .append('g')
    .attr('fill', 'none')
    .attr('stroke-opacity', 0.5)
    .selectAll()
  let rect = svg.append('g').selectAll()
  let labels = svg.append('g').selectAll()

  let uid = 0

  function resize (width, height) {
    svg.attr('width', width).attr('height', height)
    sankey.extent([
      [0, 0],
      [width, height]
    ])

    const { nodes, links } = sankey(data)

    rect = rect
      .data(nodes)
      .join('rect')
      .attr('class', 'node')
      .attr('fill', d => d.color)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)

    link = link
      .data(links)
      .join(enter => {
        const g = enter.append('g').style('mix-blend-mode', 'plus-lighter')
        const gradient = g
          .append('linearGradient')
          .attr('id', d => (d.uid = `gradient-${++uid}`))
          .attr('gradientUnits', 'userSpaceOnUse')
        gradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', d => d.source.color)
        gradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', d => d.target.color)
        g.append('path')
          .attr('stroke', d => `url(#${d.uid})`)
          .append('title')
          .text(
            d => `${d.source.name} → ${d.target.name}\n${d.value} applications`
          )
        return g
      })
      .attr('stroke-width', d => Math.max(1, d.width))
    link
      .select('linearGradient')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0)
    link.select('path').attr('d', sankeyLinkHorizontal())

    labels = labels
      .data(nodes)
      .join(enter => {
        const g = enter.append('g')
        g.append('text')
          .attr('dy', '-0.6em')
          .attr('class', 'node-name')
          .text(d => (d.value > 0 ? d.name : ''))
        g.append('text')
          .attr('dy', '0.6em')
          .attr('class', 'node-value')
          .text(d => (d.value > 0 ? d.value : ''))
        return g
      })
      .attr(
        'transform',
        d =>
          `translate(${d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6}, ${
            (d.y1 + d.y0) / 2
          })`
      )
      .attr('text-anchor', d => (d.x0 < width / 2 ? 'start' : 'end'))
  }

  container.append(svg.node())
  new ResizeObserver(([{ contentBoxSize }]) => {
    const [{ blockSize, inlineSize }] = contentBoxSize
    resize(inlineSize, blockSize)
  }).observe(container)
}
