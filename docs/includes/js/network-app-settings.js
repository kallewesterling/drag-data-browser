/* eslint-disable no-undef */

document.querySelector('#toggleFullscreen').addEventListener('click', () => {
  if (d3.select('body').attr('data-fullscreen') === 'true') {
    d3.select('body').style('left', '0px');
    d3.select('body').style('width', 'inherit');
    d3.select('body').attr('data-fullscreen', 'false');
    return true;
  }
  if (window.innerWidth < 1199.98) {
    // console.log('small window');
    d3.select('body').style('left', '-4.5em');
    d3.select('body').style('width', 'calc(100% + 4.5em)');
    d3.select('body').attr('data-fullscreen', 'true');
    return true;
  }
  d3.select('body').style('left', 'calc(-280px - 1.5em)');
  d3.select('body').style('width', 'calc(100% + (280px + 1.5em))');
  d3.select('body').attr('data-fullscreen', 'true');
  return true;
});

window.changeSetting = changeSetting;
