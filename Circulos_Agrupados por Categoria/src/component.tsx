import * as React from 'react';
import * as d3 from 'd3';

export interface IProps {
  xData: string[];
  y2Data: number[];
  displayName: string;
  categories: string[];
  width: number;
  height: number;
}

// Define an interface for the nodes
interface Node extends d3.SimulationNodeDatum {
  radius: number;
  value: number;
  category: string;
  displayName: string;
  label: string;
}

export class ReactCircleCard extends React.Component<IProps> {
  private svgRef: React.RefObject<SVGSVGElement>;
  private simulation: d3.Simulation<Node, undefined>;

  constructor(props: IProps) {
    super(props);
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart();
  }

  drawChart() {
    if (!this.svgRef.current) return;

    const svg = d3.select(this.svgRef.current);

    // Clear previous chart
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 306 - margin.left - margin.right;
    const height = 203 - margin.top - margin.bottom;

    // Calculate bubble size based on the available area
    const area = width * height;
    const bubbleSize = d3.scaleSqrt()
      .domain([0, d3.max(this.props.y2Data) || 0])
      .range([0, Math.sqrt(area / this.props.y2Data.length)]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(this.props.categories);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const nodes: Node[] = this.props.y2Data.map((d, i) => ({
      radius: bubbleSize(d),
      value: d,
      displayName: this.props.displayName,
      category: this.props.categories[i],
      label: this.props.xData[i],
      index: i,
      x: Math.random() * width,
      y: Math.random() * height
    }));

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(200, 200, 200, 0.8)')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    this.simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-15))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<Node>().radius((d) => d.radius + 1).strength(1))
      .force('radial', d3.forceRadial<Node>(Math.min(width, height) / 4, width / 2, height / 2).strength(0.1))
      .alphaDecay(0.01)
      .alphaMin(0.01)
      .on('tick', () => {
        g.selectAll<SVGCircleElement, Node>('.bubble')
          .attr('cx', (d) => Math.max(d.radius, Math.min(width - d.radius, d.x)))
          .attr('cy', (d) => Math.max(d.radius, Math.min(height - d.radius, d.y)));
      });

    const drag = d3.drag<SVGCircleElement, Node>()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const bubble = g.selectAll('.bubble')
      .data(nodes)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.radius)
      .attr('fill', d => color(d.category))
      .attr('opacity', 0.7)
      .call(drag)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke', 'black');
        tooltip
          .style('display', 'block')
          .html(`<strong>${d.label}</strong><br/> <strong>${d.category}</strong><br/> ${d.displayName} ${d.value}`);
      })
      .on('mousemove', function (event, d) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('stroke', 'none');
        tooltip.style('display', 'none');
      });
  }

  render() {
    return (
      <div className="circleCard">
        <svg ref={this.svgRef} width={306} height={203} />
      </div>
    );
  }
}
