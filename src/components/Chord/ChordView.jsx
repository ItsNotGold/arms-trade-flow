import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { loadAllCountries } from '../../utils/dataLoader';
import { isoToName, formatTIV } from '../../utils/formatters';

export default function ChordView({ arcs = [] }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  
  const [groupMode, setGroupMode] = useState('region'); // 'region' or 'country'
  const [countryProfiles, setCountryProfiles] = useState({});
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    loadAllCountries().then(data => setCountryProfiles(data || {}));
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    // Add a slight delay for initial layout measuring
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dataMatrix = useMemo(() => {
    if (!arcs.length) return { matrix: [], names: [], totals: [] };

    const getRegion = (iso) => {
      if (countryProfiles[iso] && countryProfiles[iso].region) {
        return countryProfiles[iso].region;
      }
      return 'Unknown';
    };

    let entities = [];
    let flowData = [];

    if (groupMode === 'region') {
      const regions = new Set();
      flowData = arcs.map(a => {
        const source = getRegion(a.supplier_iso);
        const target = getRegion(a.recipient_iso);
        regions.add(source);
        regions.add(target);
        return { source, target, tiv: a.tiv };
      });
      entities = Array.from(regions).sort();
    } else {
      // Country mode: top 15 by total flow volume
      const countryTivs = {};
      arcs.forEach(a => {
        countryTivs[a.supplier_iso] = (countryTivs[a.supplier_iso] || 0) + a.tiv;
        countryTivs[a.recipient_iso] = (countryTivs[a.recipient_iso] || 0) + a.tiv;
      });
      
      const topCountries = Object.entries(countryTivs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(e => e[0]);
        
      flowData = arcs.map(a => {
        const source = topCountries.includes(a.supplier_iso) ? isoToName(a.supplier_iso) : 'Other';
        const target = topCountries.includes(a.recipient_iso) ? isoToName(a.recipient_iso) : 'Other';
        return { source, target, tiv: a.tiv };
      });
      
      entities = [...topCountries.map(isoToName), 'Other'];
    }

    const nameToIndex = {};
    entities.forEach((n, i) => { nameToIndex[n] = i; });
    
    const matrix = Array(entities.length).fill(0).map(() => Array(entities.length).fill(0));
    const totals = Array(entities.length).fill(0);
    
    flowData.forEach(f => {
      const sIdx = nameToIndex[f.source];
      const tIdx = nameToIndex[f.target];
      if (sIdx !== undefined && tIdx !== undefined) {
        matrix[sIdx][tIdx] += f.tiv;
        totals[sIdx] += f.tiv;
        totals[tIdx] += f.tiv;
      }
    });

    return { matrix, names: entities, totals };
  }, [arcs, groupMode, countryProfiles]);

  useEffect(() => {
    if (!dataMatrix.matrix || !dataMatrix.matrix.length || !dataMatrix.names || !dataMatrix.names.length || !svgRef.current) return;
    
    const { matrix, names } = dataMatrix;
    const { width, height } = dimensions;
    
    // Ensure matrix is a valid 2D square array
    if (!Array.isArray(matrix) || matrix.length === 0 || !matrix.every(row => Array.isArray(row) && row.length === matrix.length)) {
      console.warn('Invalid matrix structure for chord diagram');
      return;
    }
    
    const innerRadius = Math.min(width, height) * 0.5 - 120;
    const outerRadius = innerRadius + 15;

    // Darkened Tableau10 scale
    const colorScale = d3.scaleOrdinal()
      .domain(names)
      .range(d3.schemeTableau10.map(c => d3.color(c).darker(0.3).formatHex()));

    const svgNode = d3.select(svgRef.current);
    svgNode.selectAll('*').remove();

    const svg = svgNode
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const chord = d3.chord()
      .padAngle(0.04)
      .sortSubgroups(d3.descending)(matrix);

    // Validate chord result has expected structure
    // chord is an array of ribbons with a .groups property
    if (!Array.isArray(chord) || !Array.isArray(chord.groups) || chord.length === 0) {
      console.warn('Chord computation returned invalid structure:', chord);
      return; // Exit early if chord is malformed
    }

    const arcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbonGenerator = d3.ribbon()
      .radius(innerRadius);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'chord-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(13, 16, 30, 0.95)')
      .style('color', '#fff')
      .style('padding', '10px')
      .style('border-radius', '6px')
      .style('border', '1px solid #1e2330')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', 1000)
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.3)');

    const totalTiv = d3.sum(matrix.flat());

    const group = svg.append('g')
      .selectAll('g')
      .data(chord.groups)
      .enter().append('g');

    group.append('path')
      .style('fill', d => colorScale(names[d.index]))
      .style('stroke', '#0a0c10')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .transition().duration(300).ease(d3.easeQuadOut)
      .style('opacity', 1)
      .attr('d', arcGenerator);
    
    // Attach event listeners after transition (can't attach during transition)
    group.select('path')
      .on('mouseover', function(event, d) {
        svg.selectAll('.ribbon')
          .filter(r => r.source.index !== d.index && r.target.index !== d.index)
          .transition().duration(200).ease(d3.easeQuadOut)
          .style('opacity', 0.1);
      })
      .on('mouseout', function() {
        svg.selectAll('.ribbon').transition().duration(200).ease(d3.easeQuadOut).style('opacity', 0.6);
      });

    // Label positioning
    group.append('text')
      .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr('dy', '.35em')
      .attr('transform', d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 15})
        ${d.angle > Math.PI ? 'rotate(180)' : ''}
      `)
      .style('text-anchor', d => d.angle > Math.PI ? 'end' : null)
      .style('fill', '#94a3b8')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('font-family', 'ui-sans-serif, system-ui, sans-serif')
      .text(d => names[d.index]);

    svg.append('g')
      .attr('fill-opacity', 0.6)
      .selectAll('path')
      .data(chord)
      .enter().append('path')
      .attr('class', 'ribbon')
      .attr('d', ribbonGenerator)
      .style('fill', d => colorScale(names[d.source.index]))
      .style('stroke', d => d3.rgb(colorScale(names[d.source.index])).darker(0.5))
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .transition().duration(400).ease(d3.easeQuadOut)
      .style('opacity', 0.6);
    
    // Attach event listeners to ribbons after transition (can't attach during transition)
    svg.selectAll('.ribbon')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(150).style('opacity', 1).style('stroke-width', 2);
        svg.selectAll('.ribbon').filter(r => r !== d).transition().duration(150).style('opacity', 0.1);
        
        const sourceName = names[d.source.index];
        const targetName = names[d.target.index];
        const val = d.source.value;
        const pct = ((val / totalTiv) * 100).toFixed(1);
        
        tooltip.html(`
          <div style="color: ${colorScale(sourceName)}; font-weight: bold; margin-bottom: 4px;">
            ${sourceName} &rarr; ${targetName}
          </div>
          <div style="color: #94a3b8;">TIV Volume: <span style="color: #fff">${formatTIV(val)}</span></div>
          <div style="color: #94a3b8;">Global Share: <span style="color: #fff">${pct}%</span></div>
        `)
        .style('visibility', 'visible');
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
               .style('left', (event.pageX + 15) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(150).style('stroke-width', 1);
        svg.selectAll('.ribbon').transition().duration(150).style('opacity', 0.6);
        tooltip.style('visibility', 'hidden');
      });

      return () => {
        tooltip.remove();
      };
  }, [dataMatrix, dimensions, groupMode]);

  return (
    <div className="w-full h-full relative flex flex-col rounded-3xl overflow-hidden" style={{ background: '#0a0c10' }}>
      {/* Top right floating toggles */}
      <div className="absolute top-4 right-4 z-20 flex bg-[#0d101e]/85 backdrop-blur-md rounded-lg p-1 border border-[#1e2330]">
        <button
          onClick={() => setGroupMode('region')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            groupMode === 'region' ? 'bg-accent text-white' : 'text-text-muted hover:text-white'
          }`}
        >
          By Region
        </button>
        <button
          onClick={() => setGroupMode('country')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            groupMode === 'country' ? 'bg-accent text-white' : 'text-text-muted hover:text-white'
          }`}
        >
          Top 15 Countries
        </button>
      </div>

      <div className="flex-1 w-full h-full" ref={wrapperRef}>
        {!arcs.length && (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
            No flows found for the current filter criteria.
          </div>
        )}
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}
