import * as d3 from './d3.min.mjs'

const margin = {
  top: 40,
  bottom: 40
}
const gap = 2
const rejectWidth = 5
const ghostedPadding = 300

export function timeline ({
  scrollContainer,
  container,
  dateDisplay,
  data,
  note,
  noteDate
}) {
  const dates = data.flatMap(Object.values).filter(date => date)
  const minDate = dates.reduce(
    (cum, curr) => Math.min(cum, curr.getTime()),
    Infinity
  )
  const maxDate = dates.reduce(
    (cum, curr) => Math.max(cum, curr.getTime()),
    -Infinity
  )
  const width = ((maxDate - minDate) / 1000 / 60 / 60 / 24) * 10
  const totalWidth = width + ghostedPadding
  const svg = d3.create('svg').attr('width', totalWidth)
  const xScale = d3
    .scaleUtc()
    .domain([minDate, maxDate])
    .range([0, width])
    .nice()
  const xAxis = svg
    .append('g')
    .attr('class', 'axis')
    .call(d3.axisBottom(xScale))

  const noteElem = svg
    .append('text')
    .attr('class', 'note')
    .attr('x', xScale(noteDate ?? minDate))
    .text(note)

  const clipPath = svg
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)

  const gradient = svg
    .append('linearGradient')
    .attr('id', 'gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', width)
    .attr('x2', totalWidth)
  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#74e0ff')
  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'rgba(255, 255, 255, 0.5)')

  const rectDim = svg
    .append('g')
    .attr('fill', 'rgba(255, 255, 255, 0.1)')
    .selectAll()
    .data(data)
    .join('rect')
    .attr('x', d => xScale(d.applied.getTime()))
    .attr('width', d =>
      d.rejected
        ? xScale(d.rejected.getTime()) - xScale(d.applied.getTime())
        : totalWidth - xScale(d.applied.getTime())
    )

  const clipped = svg.append('g').attr('clip-path', 'url(#clip)').selectAll()
  const rectLit = clipped
    .data(data)
    .join('rect')
    .attr('fill', 'url(#gradient)')
    .attr('x', d => xScale(d.applied.getTime()))
    .attr('width', d =>
      d.rejected
        ? xScale(d.rejected.getTime()) -
          xScale(d.applied.getTime()) -
          rejectWidth -
          gap
        : totalWidth - xScale(d.applied.getTime())
    )
  const rejected = clipped
    .data(
      data.flatMap(({ rejected }, i) =>
        rejected ? { date: rejected.getTime(), i } : []
      )
    )
    .join('rect')
    .attr('fill', '#fca5a5')
    .attr('x', ({ date }) => xScale(date) - rejectWidth)
    .attr('width', rejectWidth)

  function resize (height) {
    const effectiveHeight = height - margin.top - margin.bottom
    const spacing = effectiveHeight / data.length
    svg.attr('height', height)
    rectDim
      .attr('y', (_, i) => i * spacing + margin.top)
      .attr('height', spacing - gap)
    rectLit
      .attr('y', (_, i) => i * spacing + margin.top)
      .attr('height', spacing - gap)
    rejected
      .attr('y', ({ i }) => i * spacing + margin.top)
      .attr('height', spacing - gap)
    clipPath.attr('height', height)
    noteElem.attr('y', height - margin.bottom - 20)
    xAxis.attr('transform', `translate(0, ${height - margin.bottom})`)
  }

  const svgNode = svg.node()
  container.append(svgNode)
  new ResizeObserver(([{ contentBoxSize }]) => {
    const [{ blockSize, inlineSize }] = contentBoxSize
    svgNode.style.padding = `0 ${inlineSize / 2}px`
    scrollContainer.style.height = `${totalWidth + blockSize}px`
    resize(blockSize)
  }).observe(container)

  function handleScroll () {
    const scroll = Math.min(
      Math.max(-scrollContainer.getBoundingClientRect().top, 0),
      totalWidth
    )
    clipPath.attr('width', scroll)
    svgNode.style.transform = `translateX(${-scroll}px)`
    dateDisplay.textContent = new Date(xScale.invert(scroll)).toLocaleString(
      [],
      {
        dateStyle: 'long',
        timeZone: 'UTC'
      }
    )
  }
  window.requestAnimationFrame(handleScroll)
  window.addEventListener('scroll', handleScroll)
}
