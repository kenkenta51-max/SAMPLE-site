const dialog = document.getElementById('lightbox');
const dialogImage = document.getElementById('lightboxImage');
const closeButton = document.querySelector('.lightbox-close');

document.querySelectorAll('.slide-button').forEach((button) => {
  button.addEventListener('click', () => {
    dialogImage.src = button.dataset.src;
    dialog.showModal();
  });
});

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
