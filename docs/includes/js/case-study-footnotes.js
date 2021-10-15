console.log('here');

document.querySelectorAll('.footnote-back').forEach(elem=>{
    elem.addEventListener('click', (evt) => {
        let element = document.querySelector(`#inlineFootnote${evt.target.dataset.inlineFootnote}`);
        element.scrollIntoView({behavior: "smooth"});
    });
    // document.querySelector('main').scrollTop = document.querySelector('#inlineFootnote3').getBoundingClientRect().top
})
