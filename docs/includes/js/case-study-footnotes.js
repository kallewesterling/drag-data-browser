document.querySelectorAll('.footnote-back').forEach((elem) => {
  elem.addEventListener('click', (evt) => {
    const element = document.querySelector(`#inlineFootnote${evt.target.dataset.inlineFootnote}`);
    element.scrollIntoView({ behavior: 'smooth' });
  });
});
