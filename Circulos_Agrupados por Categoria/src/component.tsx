import * as React from 'react';
import * as d3 from 'd3';

export interface IProps {
  xData: string[];
  y2Data: number[];
  displayName:string;
  categories: string[];
  width: number,
  height: number
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

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = +svg.attr('width')! - margin.left - margin.right;
    const height = +svg.attr('height')! - margin.top - margin.bottom;

    const bubbleSize = d3.scaleSqrt()
      .domain([0, d3.max(this.props.y2Data) || 0])
      .range([0, 50]); // Adjust the range as needed for the size of the bubbles

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(this.props.categories);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create nodes data for force simulation
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

    // Tooltip container
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(200, 200, 200, 0.8)')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    // Using force simulation to prevent overlaps and cluster by category
// Usando la simulación de fuerzas para evitar superposiciones y agrupar por categoría
this.simulation = d3.forceSimulation(nodes)
  .force('charge', d3.forceManyBody().strength((d: Node) => {
    // Incrementa la fuerza entre nodos dentro de la misma categoría
    return d.category === this.props.displayName ? -30 : -10;
  }))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collide', d3.forceCollide<Node>().radius((d) => d.radius + 1).strength(0.2)) // Reduce la fuerza de colisión
  .force('x', d3.forceX<Node>().x((d) => {
    const categoryIndex = this.props.categories.indexOf(d.category);
    const categoryCount = this.props.categories.length;
    const categoryCenters = Array.from({length: categoryCount}, (_, i) => width / (categoryCount + 1) * (i + 1));
    return categoryCenters[categoryIndex];
  }).strength(0.2)) // Añade una fuerza en el eje X para mantener los nodos dentro del marco
  .force('y', d3.forceY<Node>().y(height / 2).strength(0.2)) // Añade una fuerza en el eje Y para mantener los nodos dentro del marco
  .alphaDecay(0.05) // Reducir la velocidad de movimiento general
  .on('tick', () => {
    g.selectAll<SVGCircleElement, Node>('.bubble')
      .attr('cx', (d) => Math.max(d.radius, Math.min(width - d.radius, d.x))) // Limita la posición X de los nodos para que no se salgan del marco
      .attr('cy', (d) => Math.max(d.radius, Math.min(height - d.radius, d.y))); // Limita la posición Y de los nodos para que no se salgan del marco
  });



    const drag = d3.drag<SVGCircleElement, Node>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);

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
      })
      .on('click', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = null;
        d.fy = null;
      });

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, undefined>, d: Node) {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, undefined>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, undefined>, d: Node) {
      if (!event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      // Reiniciar la simulación con la nueva configuración de fuerzas
      this.simulation
        .alpha(0.3)
        .force('charge', d3.forceManyBody().strength(5))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide<Node>().radius(d => d.radius + 1))
        .force('x', d3.forceX<Node>().x(d => {
          // Agrupar nodos por categoría
          if (d.category === 'A') return width / 4;
          else if (d.category === 'B') return 2 * width / 4;
          else return 3 * width / 4;
        }))
        .force('y', d3.forceY<Node>().y(height / 2))
        .restart();
    }
  }

  render() {
    return (
      <div className="circleCard">
        <svg ref={this.svgRef} width={400} height={400} />
      </div>
    );
  }
}
