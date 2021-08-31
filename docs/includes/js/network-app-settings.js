document.querySelector('#toggleFullscreen').addEventListener("click", (evt) => {
    if (d3.select('body').attr('data-fullscreen') === 'true') {
        d3.select('body').style('left', '0px')
        d3.select('body').style('width', 'inherit')
        d3.select('body').attr('data-fullscreen', 'false')
    } else {
        d3.select('body').style('left', '-280px')
        d3.select('body').style('width', 'calc(100% + 280px)')
        d3.select('body').attr('data-fullscreen', 'true')
    }
})