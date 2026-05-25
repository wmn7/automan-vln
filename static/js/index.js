window.HELP_IMPROVE_VIDEOJS = false;

function pauseOtherVideos(activeVideo) {
  document.querySelectorAll('video').forEach((video) => {
    if (video !== activeVideo && !video.paused) {
      video.pause();
    }
  });
}

function setActiveDemo(filter) {
  document.querySelectorAll('[data-demo-filter]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.demoFilter === filter);
  });

  document.querySelectorAll('[data-demo-kind]').forEach((card) => {
    const visible = filter === 'all' || card.dataset.demoKind === filter;
    card.hidden = !visible;
  });
}

function initStoryboards() {
  const modal = document.getElementById('storyboard-modal');
  const modalContent = modal?.querySelector('.storyboard-modal-content');
  const modalImage = document.getElementById('storyboard-modal-image');
  const modalClose = modal?.querySelector('.storyboard-modal-close');

  document.querySelectorAll('.storyboard-frame').forEach((frame) => {
    frame.addEventListener('click', () => {
      const target = document.getElementById(frame.dataset.targetVideo);
      const time = Number(frame.dataset.time || 0);
      if (target instanceof HTMLVideoElement) {
        target.currentTime = time;
        target.play().catch(() => {});
      } else if (target instanceof HTMLIFrameElement && target.src.includes('youtube.com/embed/')) {
        const youtubeId = frame.dataset.youtubeId;
        const url = new URL(youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : target.src);
        url.searchParams.set('start', String(Math.max(0, Math.floor(time))));
        url.searchParams.set('autoplay', '1');
        target.src = url.toString();
      }
    });

    const zoom = frame.querySelector('.storyboard-zoom');
    zoom?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!modal || !modalContent || !modalImage) return;

      const image = frame.querySelector('.storyboard-image img');
      if (image?.getAttribute('src')) {
        modalImage.src = image.src;
        modalImage.alt = image.alt || 'Zoomed key moment';
        modalContent.classList.add('has-image');
      } else {
        modalImage.removeAttribute('src');
        modalContent.classList.remove('has-image');
      }

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
  }

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function initVideoFallbacks() {
  document.querySelectorAll('video').forEach((video) => {
    const source = video.querySelector('source');

    function showFallback() {
      if (video.dataset.fallbackHandled === 'true') return;
      if (!video.error && video.networkState !== HTMLMediaElement.NETWORK_NO_SOURCE) return;

      video.dataset.fallbackHandled = 'true';
      const fallback = document.createElement('div');
      fallback.className = 'video-unavailable';
      fallback.innerHTML = '<strong>Video coming soon</strong><span>Demo media will be added after upload.</span>';
      video.replaceWith(fallback);
    }

    video.addEventListener('error', showFallback);
    source?.addEventListener('error', showFallback);
    window.setTimeout(showFallback, 1800);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.navbar-burger').forEach((burger) => {
    burger.addEventListener('click', () => {
      burger.classList.toggle('is-active');
      document.querySelector('.navbar-menu')?.classList.toggle('is-active');
    });
  });

  document.querySelectorAll('video').forEach((video) => {
    video.addEventListener('play', () => pauseOtherVideos(video));
  });

  document.querySelectorAll('[data-demo-filter]').forEach((button) => {
    button.addEventListener('click', () => setActiveDemo(button.dataset.demoFilter));
  });

  initStoryboards();
  initVideoFallbacks();
  setActiveDemo('wheel');
});
