const isProjectsPage = document.body.classList.contains('projects-page');
const hasNavigationContext = Boolean(document.referrer) || window.history.length > 1 || Boolean(window.opener);

if (isProjectsPage && !hasNavigationContext) {
  window.location.replace('index.html');
}

const tabs = [...document.querySelectorAll('[data-project-tab]')];
const panels = [...document.querySelectorAll('[data-project-panel]')];
const projectsScroller = document.querySelector('.projects-page .projects-main');
const inquireButton = document.querySelector('[data-inquire-btn]');
const homeCarousels = [...document.querySelectorAll('[data-home-carousel]')];

if (tabs.length && panels.length) {
  const toggleInquireButton = (panelName) => {
    if (!inquireButton) {
      return;
    }

    const canInquire = panelName === 'couples' || panelName === 'grads';
    inquireButton.hidden = !canInquire;
    inquireButton.setAttribute('aria-hidden', String(!canInquire));

    if (canInquire) {
      const label = panelName === 'couples' ? 'Inquire (Couples)' : 'Inquire (Grads)';
      inquireButton.textContent = label;
      inquireButton.dataset.targetInquiry = `inquiry-${panelName}`;
    } else {
      inquireButton.dataset.targetInquiry = '';
    }
  };

  const switchPanel = (panelName) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.projectTab === panelName;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.projectPanel === panelName;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    if (projectsScroller) {
      projectsScroller.scrollTo({ top: 0, behavior: 'auto' });
    }

    toggleInquireButton(panelName);
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchPanel(tab.dataset.projectTab));
  });

  const currentTab = tabs.find((tab) => tab.classList.contains('is-active'));
  toggleInquireButton(currentTab ? currentTab.dataset.projectTab : '');
}

if (inquireButton && projectsScroller) {
  inquireButton.addEventListener('click', () => {
    const targetId = inquireButton.dataset.targetInquiry;
    if (!targetId) {
      return;
    }

    const inquirySection = document.getElementById(targetId);
    if (!inquirySection) {
      return;
    }

    const scrollerRect = projectsScroller.getBoundingClientRect();
    const targetRect = inquirySection.getBoundingClientRect();
    const nextTop = projectsScroller.scrollTop + (targetRect.top - scrollerRect.top) - 10;
    projectsScroller.scrollTo({ top: nextTop, behavior: 'smooth' });
  });
}

if (homeCarousels.length) {
  homeCarousels.forEach((carousel) => {
    const track = carousel.querySelector('[data-home-track]');
    if (!track) {
      return;
    }

    const originalTiles = [...track.children];
    if (!originalTiles.length) {
      return;
    }

    originalTiles.forEach((tile) => {
      track.appendChild(tile.cloneNode(true));
    });

    let loopHeight = track.scrollHeight / 2;
    let offset = 0;
    const direction = carousel.dataset.homeDirection === 'down' ? 'down' : 'up';
    const autoSpeedPxPerSecond = 70;
    let lastFrameTime = 0;

    const recalcLoopHeight = () => {
      loopHeight = track.scrollHeight / 2;
    };

    const animate = (timestamp) => {
      if (!loopHeight) {
        recalcLoopHeight();
      }

      if (!lastFrameTime) {
        lastFrameTime = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
      lastFrameTime = timestamp;

      offset += autoSpeedPxPerSecond * deltaSeconds;

      if (loopHeight && offset >= loopHeight) {
        offset -= loopHeight;
      }

      const translateY = direction === 'down' ? offset - loopHeight : -offset;
      track.style.transform = `translateY(${translateY}px)`;
      window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', recalcLoopHeight);
    window.requestAnimationFrame(animate);
  });
}

const inquiryForms = [...document.querySelectorAll('.inquiry-form')];

if (inquiryForms.length) {
  const thankYouMessage = 'Thanks for inquiring, I will get back to you within 48 hours.';
  const transitionMs = 260;

  inquiryForms.forEach((form) => {
    const submitButton = form.querySelector('[type="submit"]');
    const inquiryWrap = form.closest('.inquiry-wrap');
    let statusNode = form.querySelector('.inquiry-status');

    if (!statusNode) {
      statusNode = document.createElement('p');
      statusNode.className = 'inquiry-status';
      statusNode.hidden = true;
      statusNode.setAttribute('aria-live', 'polite');
      form.appendChild(statusNode);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      let didSubmit = false;

      if (submitButton) {
        submitButton.disabled = true;
      }

      statusNode.hidden = true;
      statusNode.classList.remove('is-error');

      if (inquiryWrap) {
        inquiryWrap.classList.add('is-submitting');
      }

      try {
        const response = await fetch(form.action, {
          method: (form.method || 'POST').toUpperCase(),
          body: new FormData(form),
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        didSubmit = true;
        form.reset();

        if (inquiryWrap) {
          const wrapHeight = inquiryWrap.offsetHeight;
          const finalHeight = Math.max(150, Math.round(wrapHeight * 0.52));
          inquiryWrap.style.minHeight = wrapHeight + 'px';
          inquiryWrap.classList.add('is-exiting');

          window.setTimeout(() => {
            inquiryWrap.classList.remove('is-exiting', 'is-submitting');
            inquiryWrap.classList.add('is-submitted');
            inquiryWrap.style.minHeight = finalHeight + 'px';
            inquiryWrap.innerHTML = `<p class="inquiry-thank-you" role="status" aria-live="polite">${thankYouMessage}</p>`;
          }, transitionMs);

          return;
        }

        statusNode.textContent = thankYouMessage;
      } catch (error) {
        statusNode.textContent = 'Something went wrong. Please try again.';
        statusNode.classList.add('is-error');
      } finally {
        if (didSubmit && inquiryWrap) {
          return;
        }

        statusNode.hidden = false;

        if (submitButton) {
          submitButton.disabled = false;
        }

        if (inquiryWrap) {
          inquiryWrap.classList.remove('is-submitting');
          inquiryWrap.style.minHeight = '';
        }
      }
    });
  });
}
