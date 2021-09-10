/* eslint-disable indent */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

entity = (character) => `&#${character.charCodeAt(0).toString()}`;

function swatches({
  color,
  selected = undefined,
  columns = null,
  format = (x) => graph.stateSlugToName[x],
  swatchSize = 7,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
  restrictStates = [],
}) {
  let values = color.domain().filter((value) => restrictStates.includes(value));

  if (selected) {
    values = values.filter((value) => value !== selected);
    values.splice(0, 0, selected);
  }

  const id = `O-${swatches._id = (swatches._id || 0) + 1}`;
  let html;

  if (columns !== null) {
    html = `
      <div style="display: flex; align-items: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;">
        <style>
          .${id}-item { break-inside: avoid; display: flex; align-items: center; padding-bottom: 1px; }
          .${id}-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: calc(100% - ${+swatchWidth}px - 0.5em); }
          .${id}-swatch { width: ${+swatchWidth}px; height: ${+swatchHeight}px; margin: 0 0.5em 0 0; }
        </style>
        <div style="width: 300px; columns: ${columns};">${values.map((value) => {
          const label = format(value);
          return `<div class="${id}-item">
            <div class="${id}-swatch" style="background:${color(value)};"></div>
            <div class="${id}-label" title="${label.replace(/["&]/g, entity)}">${label}</div>
          </div>`;
        })}
        </div>
      </div>`;
      return html;
    }

  html = `
    <div style="display: flex; align-items: center; min-height: 33px; margin-left: ${+marginLeft}px; font: 10px sans-serif;">
      <style>
        .${id} { display: inline-flex; align-items: center; margin-right: 1em; }
        .${id}::before { content: ""; width: ${+swatchWidth}px; height: ${+swatchHeight}px; margin-right: 0.5em; background: var(--color); }
      </style>
      <div>`;
  values.forEach((value) => html += `<span class="${id}" style="--color: ${color(value)}">${selected && selected === value ? '<strong>' : ''}${format(value)}${selected && selected === value ? '</strong>' : ''}</span>`);
  html += '</div>';

  return html;
}

function showLegend(color, options) {
  const html = swatches({ ...options, color });
  d3.select('div#legend').html(html);
  d3.select('div#legend').classed('d-none', false);
}
