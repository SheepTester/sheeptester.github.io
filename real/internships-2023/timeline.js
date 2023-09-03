import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.8.5/+esm'

const margin = {
  bottom: 40
}
const gap = 2

export function timeline (scrollContainer, container, data) {
  const dates = data.flat()
  const minDate = dates.reduce(
    (cum, curr) => Math.min(cum, curr.getTime()),
    Infinity
  )
  const maxDate = dates.reduce(
    (cum, curr) => Math.max(cum, curr.getTime()),
    -Infinity
  )
  const width = ((maxDate - minDate) / 1000 / 60 / 60 / 24) * 10
  const svg = d3.create('svg').attr('width', width)
  const xScale = d3.scaleUtc().domain([minDate, maxDate]).range([0, width])
  const xAxis = svg
    .append('g')
    .attr('class', 'axis')
    .call(d3.axisBottom(xScale))

  let rect = svg
    .append('g')
    .attr('fill', 'white')
    .selectAll()
    .data(data)
    .join('rect')
    .attr('x', d => xScale(d[0].getTime()))
    .attr(
      'width',
      d => xScale(d[1]?.getTime() ?? maxDate) - xScale(d[0].getTime())
    )

  function resize (height) {
    const effectiveHeight = height - margin.bottom
    const spacing = effectiveHeight / data.length
    svg.attr('height', height)
    rect.attr('y', (_, i) => i * spacing)
    rect.attr('height', spacing - gap)
    xAxis.attr('transform', `translate(0, ${height - margin.bottom})`)
  }

  const svgNode = svg.node()
  container.append(svgNode)
  new ResizeObserver(([{ contentBoxSize }]) => {
    const [{ blockSize, inlineSize }] = contentBoxSize
    svgNode.style.padding = `0 ${inlineSize / 2}px`
    scrollContainer.style.height = `${width + blockSize}px`
    resize(blockSize)
  }).observe(container)

  window.addEventListener('scroll', () => {
    const scroll = scrollContainer.getBoundingClientRect().top - 20
    svgNode.style.transform = `translateX(${Math.max(
      Math.min(scroll, 0),
      -width
    )}px)`
  })
}
