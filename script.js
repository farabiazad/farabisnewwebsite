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
const projectCarousels = [...document.querySelectorAll('[data-project-carousel]')];

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

if (inquireButton) {
  inquireButton.addEventListener('click', () => {
    const targetId = inquireButton.dataset.targetInquiry;
    if (!targetId) {
      return;
    }

    const inquirySection = document.getElementById(targetId);
    if (!inquirySection) {
      return;
    }

    inquirySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (homeCarousels.length) {
  const isTouchHorizontalTicker = () =>
    window.matchMedia('(max-width: 820px) and (hover: none) and (pointer: coarse)').matches;

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

    let axis = isTouchHorizontalTicker() ? 'x' : 'y';
    let loopSize = axis === 'x' ? track.scrollWidth / 2 : track.scrollHeight / 2;
    let offset = 0;
    const baseDirection = carousel.dataset.homeDirection === 'down' ? 'down' : 'up';
    const autoSpeedPxPerSecond = 70;
    let lastFrameTime = 0;

    const recalcLoopSize = () => {
      loopSize = axis === 'x' ? track.scrollWidth / 2 : track.scrollHeight / 2;
    };

    const recalcAxis = () => {
      const nextAxis = isTouchHorizontalTicker() ? 'x' : 'y';
      if (nextAxis !== axis) {
        axis = nextAxis;
        offset = 0;
      }

      recalcLoopSize();
    };

    const animate = (timestamp) => {
      if (!loopSize) {
        recalcLoopSize();
      }

      if (!lastFrameTime) {
        lastFrameTime = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
      lastFrameTime = timestamp;

      offset += autoSpeedPxPerSecond * deltaSeconds;

      if (loopSize && offset >= loopSize) {
        offset -= loopSize;
      }

      if (axis === 'x') {
        const horizontalDirection = baseDirection === 'down' ? 'right' : 'left';
        const translateX = horizontalDirection === 'right' ? offset - loopSize : -offset;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      } else {
        const translateY = baseDirection === 'down' ? offset - loopSize : -offset;
        track.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', recalcAxis);
    window.requestAnimationFrame(animate);
  });
}

if (projectCarousels.length) {
  projectCarousels.forEach((carousel) => {
    const track = carousel.querySelector('[data-project-track]');
    if (!track) {
      return;
    }

    const originalItems = [...track.children];
    if (!originalItems.length) {
      return;
    }

    originalItems.forEach((item) => {
      track.appendChild(item.cloneNode(true));
    });

    let loopWidth = track.scrollWidth / 2;
    let offset = 0;
    const direction = carousel.dataset.projectDirection === 'right' ? 'right' : 'left';
    const autoSpeedPxPerSecond = 56;
    let lastFrameTime = 0;

    const recalcLoopWidth = () => {
      loopWidth = track.scrollWidth / 2;
    };

    const animate = (timestamp) => {
      if (!loopWidth) {
        recalcLoopWidth();
      }

      if (!lastFrameTime) {
        lastFrameTime = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
      lastFrameTime = timestamp;
      offset += autoSpeedPxPerSecond * deltaSeconds;

      if (loopWidth && offset >= loopWidth) {
        offset -= loopWidth;
      }

      const translateX = direction === 'right' ? offset - loopWidth : -offset;
      track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', recalcLoopWidth);
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
