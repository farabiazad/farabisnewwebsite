const isProjectsPage = document.body.classList.contains('projects-page');
const hasNavigationContext = Boolean(document.referrer) || window.history.length > 1 || Boolean(window.opener);

if (isProjectsPage && !hasNavigationContext) {
  window.location.replace('index.html');
}

const tabs = [...document.querySelectorAll('[data-project-tab]')];
const panels = [...document.querySelectorAll('[data-project-panel]')];
const projectsScroller = document.querySelector('.projects-page .projects-main');
const inquireButton = document.querySelector('[data-inquire-btn]');
const homeCarousel = document.querySelector('[data-home-carousel]');
const homeVideoGroups = [...document.querySelectorAll('[data-home-video-group]')];

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

if (homeCarousel) {
  const track = homeCarousel.querySelector('[data-home-track]');

  if (track) {
    const originalTiles = [...track.children];
    if (originalTiles.length) {
      originalTiles.forEach((tile) => {
        track.appendChild(tile.cloneNode(true));
      });

      let loopHeight = track.scrollHeight / 2;
      let offset = 0;
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

        track.style.transform = `translateY(${-offset}px)`;
        window.requestAnimationFrame(animate);
      };

      window.addEventListener('resize', recalcLoopHeight);
      window.requestAnimationFrame(animate);
    }
  }
}

if (homeVideoGroups.length) {
  const groupCount = homeVideoGroups.length;
  let groupIndex = 0;

  const showVideoGroup = (nextGroupIndex) => {
    groupIndex = ((nextGroupIndex % groupCount) + groupCount) % groupCount;

    homeVideoGroups.forEach((videoGroup, index) => {
      const isActive = index === groupIndex;
      videoGroup.classList.toggle('is-active', isActive);
    });
  };

  showVideoGroup(0);

  if (groupCount > 1) {
    window.setInterval(() => showVideoGroup(groupIndex + 1), 6000);
  }
}
