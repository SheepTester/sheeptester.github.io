document.addEventListener('DOMContentLoaded', e => {
  const sidebar = document.getElementById('sidebar');
  let activeLink = document.getElementById('about-link');
  const textContents = {
    about: document.getElementById('about'),
    redirects: document.getElementById('redirects')
  };
  const iframe = document.getElementById('iframe');
  sidebar.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      if (activeLink.dataset.content) textContents[activeLink.dataset.content].classList.add('hidden');
      else if (e.target.dataset.content) {
        iframe.classList.add('hidden');
        iframe.src = '';
      }
      if (e.target.dataset.content) textContents[e.target.dataset.content].classList.remove('hidden');
      else {
        iframe.classList.remove('hidden');
        iframe.src = e.target.href;
        e.preventDefault();
      }
      activeLink.classList.remove('active');
      e.target.classList.add('active');
      activeLink = e.target;
    }
  });
});
