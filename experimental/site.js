(function () {
  const content = window.siteContent;
  const projectDates = window.projectLastUpdated || {};

  if (!content) {
    return;
  }

  const normalizeProjectUrl = (url) => url.replace(/^\.\//, "").replace(/^\/+/, "");

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    if (!year || !month || !day) {
      return "";
    }

    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(year, month - 1, day));
  };

  const getProjectDate = (url) => projectDates[normalizeProjectUrl(url)];
  const normalizeLabel = (label) => label.toLowerCase().trim();

  const educationDetails = document.getElementById("education-details");
  if (educationDetails && content.education?.details) {
    educationDetails.textContent = content.education.details;
  }

  const aboutDetails = document.getElementById("about-details");
  if (aboutDetails && content.about?.details) {
    aboutDetails.textContent = content.about.details;
  }

  const skillsList = document.getElementById("skills-list");
  if (skillsList && content.skills?.length) {
    skillsList.innerHTML = content.skills
      .map(
        (skill) => `
          <li>
            <button class="skill-filter" type="button" data-skill="${skill}" title="Filter projects by ${skill}">
              <span>${skill}</span>
            </button>
          </li>
        `
      )
      .join("");
  }

  const contactLinks = document.getElementById("contact-links");
  if (contactLinks && content.contact) {
    const links = [
      content.contact.email
        ? { label: "Email", url: `mailto:${content.contact.email}` }
        : null,
      content.contact.github
        ? { label: "GitHub", url: content.contact.github }
        : null,
      content.contact.twitter
        ? { label: "Twitter", url: content.contact.twitter }
        : null
    ].filter(Boolean);

    contactLinks.innerHTML = links
      .map((link) => `<a href="${link.url}">${link.label}</a>`)
      .join("");
  }

  const getCardMarkup = (project) => {
    const image = project.image
      ? `<div class="card-media"><img src="${project.image}" alt="${project.imageAlt || ""}"></div>`
      : "";
    const tags = project.tags?.length
      ? `<ul class="tag-list">${project.tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>`
      : "";
    const formattedDate = formatDate(getProjectDate(project.url));
    const dateMarkup = formattedDate
      ? `<p class="project-date">Last updated: ${formattedDate}</p>`
      : "";
    const isHighlighted = project.highlight === true || project.highlight === "true";
    const isFeatured = project.featured === true || project.featured === "true";
    const highlightColor = project.highlightColor || project.highlightColour || "#2f6358";
    const cardClass = [
      "project-card",
      project.image ? "" : "text-only-card",
      isFeatured ? "featured-card" : "",
      isHighlighted ? "highlighted-card" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const highlightStyle = isHighlighted ? ` style="--highlight-color: ${highlightColor};"` : "";

    return `
      <a class="${cardClass}" href="${project.url}"${highlightStyle}>
        <div class="card-body">
          <h3>${project.title}</h3>
          <p>${project.summary}</p>
          <div class="card-meta">
            ${dateMarkup}
            ${tags}
          </div>
        </div>
        ${image}
      </a>
    `;
  };

  const renderCards = (containerId, projects) => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    container.innerHTML = projects.map(getCardMarkup).join("");
  };

  const renderStableColumns = (containerId, projects) => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    const columns = [[], []];
    projects.forEach((project, index) => {
      columns[index % 2].push(getCardMarkup(project));
    });

    container.innerHTML = columns
      .map((column) => `<div class="compact-column">${column.join("")}</div>`)
      .join("");
  };

  const renderResponsiveCompactCards = (containerId, projects, mediaQuery) => {
    const render = () => {
      if (mediaQuery.matches) {
        renderCards(containerId, projects);
        return;
      }

      renderStableColumns(containerId, projects);
    };

    render();
    mediaQuery.addEventListener("change", render);
  };

  renderCards("research-projects", content.researchProjects || []);
  const singleColumnQuery = window.matchMedia("(max-width: 900px)");
  renderCards("tech-projects", content.techProjects || []);
  renderCards("other-projects", content.otherProjects || []);
  renderCards("work-projects", content.workProjects || []);

  const projectScrollArea = document.querySelector(".project-sections");
  const projectTabsNav = document.querySelector(".project-tabs");
  const getProjectTabs = () => document.querySelectorAll(".project-tabs a");
  const fixedProjectSections = () =>
    Array.from(document.querySelectorAll(".project-section:not(.filtered-panel)"));
  const skillButtons = document.querySelectorAll(".skill-filter");
  const skillTagMap = content.skillTagMap || {};
  const skillProjectMap = content.skillProjectMap || {};
  let activeSkill = "";

  const groupedProjects = [
    { key: "research", projects: content.researchProjects || [] },
    { key: "tech", projects: content.techProjects || [] },
    { key: "other", projects: content.otherProjects || [] },
    { key: "work", projects: content.workProjects || [] }
  ];

  const getMappedSkillsForProject = (project, groupKey) => {
    const mappedSkills = new Set();
    const projectUrl = normalizeProjectUrl(project.url);

    (project.tags || []).forEach((tag) => {
      if (content.skills?.some((skill) => normalizeLabel(skill) === normalizeLabel(tag))) {
        mappedSkills.add(tag);
      }

      (skillTagMap[tag] || []).forEach((skill) => mappedSkills.add(skill));
    });

    if (groupKey === "tech") {
      mappedSkills.add("Computer Science");
    }

    Object.entries(skillProjectMap).forEach(([skill, urls]) => {
      if ((urls || []).some((url) => normalizeProjectUrl(url) === projectUrl)) {
        mappedSkills.add(skill);
      }
    });

    return Array.from(mappedSkills);
  };

  const getProjectsForSkill = (skill) =>
    groupedProjects.flatMap((group) =>
      group.projects.filter((project) =>
        getMappedSkillsForProject(project, group.key).some(
          (mappedSkill) => normalizeLabel(mappedSkill) === normalizeLabel(skill)
        )
      )
    );

  const removeFilteredSection = () => {
    const filteredSection = document.getElementById("filtered-project-section");

    if (filteredSection) {
      filteredSection.remove();
    }
  };

  const removeFilteredTab = () => {
    document.getElementById("filtered-projects-tab")?.remove();
  };

  const renderFilteredTab = (skill) => {
    removeFilteredTab();

    if (!skill || !projectTabsNav) {
      return;
    }

    const tab = document.createElement("a");
    tab.id = "filtered-projects-tab";
    tab.className = "filtered-tab";
    tab.href = "#filtered-projects-heading";
    tab.textContent = skill;
    tab.addEventListener("click", (event) => {
      if (scrollToProjectSection(tab.hash)) {
        event.preventDefault();
        window.history.replaceState(null, "", tab.hash);
      }
    });
    projectTabsNav.prepend(tab);
  };

  const updateSkillButtonState = () => {
    skillButtons.forEach((button) => {
      const isActive = normalizeLabel(button.dataset.skill || "") === normalizeLabel(activeSkill);
      button.classList.toggle("active-skill", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
      button.title = isActive
        ? `Clear ${button.dataset.skill} project filter`
        : `Filter projects by ${button.dataset.skill}`;
    });
  };

  const renderFilteredProjects = (skill) => {
    removeFilteredSection();

    if (!skill || !projectScrollArea) {
      return;
    }

    const matchingProjects = getProjectsForSkill(skill);
    const filteredSection = document.createElement("section");
    filteredSection.className = "panel project-section filtered-panel";
    filteredSection.id = "filtered-project-section";
    filteredSection.setAttribute("aria-labelledby", "filtered-projects-heading");
    filteredSection.innerHTML = `
      <div class="section-heading filtered-heading">
        <div>
          <p class="eyebrow">Filtered Projects</p>
          <h2 id="filtered-projects-heading">${skill}</h2>
        </div>
        <button class="clear-filter" type="button">Clear filter</button>
      </div>
      <div class="card-grid" id="filtered-projects"></div>
    `;

    projectScrollArea.prepend(filteredSection);
    renderCards("filtered-projects", matchingProjects);
    filteredSection.querySelector(".clear-filter")?.addEventListener("click", () => {
      activeSkill = "";
      removeFilteredSection();
      removeFilteredTab();
      updateSkillButtonState();
      updateActiveProjectTab();
    });
  };

  const setSkillFilter = (skill) => {
    activeSkill = normalizeLabel(activeSkill) === normalizeLabel(skill) ? "" : skill;
    renderFilteredTab(activeSkill);
    renderFilteredProjects(activeSkill);
    updateSkillButtonState();

    if (activeSkill) {
      document.getElementById("filtered-project-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    updateActiveProjectTab();
  };

  skillButtons.forEach((button) => {
    button.addEventListener("click", () => setSkillFilter(button.dataset.skill || ""));
  });
  updateSkillButtonState();

  const setActiveProjectTab = (hash) => {
    getProjectTabs().forEach((tab) => {
      const isActive = tab.hash === hash;
      tab.classList.toggle("active-tab", isActive);

      if (isActive) {
        tab.setAttribute("aria-current", "true");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
  };

  const isProjectPaneScrollable = () => {
    if (!projectScrollArea) {
      return false;
    }

    return (
      window.getComputedStyle(projectScrollArea).overflowY !== "visible" &&
      projectScrollArea.scrollHeight > projectScrollArea.clientHeight
    );
  };

  const scrollToProjectSection = (hash, behavior = "smooth") => {
    const target = hash ? document.querySelector(hash) : null;
    const section = target?.closest(".project-section");
    if (!projectScrollArea || !section) {
      return false;
    }

    if (!isProjectPaneScrollable()) {
      section.scrollIntoView({ behavior, block: "start" });
      setActiveProjectTab(hash);
      return true;
    }

    const scrollAreaTop = projectScrollArea.getBoundingClientRect().top;
    const sectionTop = section.getBoundingClientRect().top;

    projectScrollArea.scrollTo({
      top: projectScrollArea.scrollTop + sectionTop - scrollAreaTop,
      behavior
    });
    setActiveProjectTab(hash);

    return true;
  };

  const updateActiveProjectTab = () => {
    const filteredSection = document.getElementById("filtered-project-section");
    const projectSections = filteredSection
      ? [filteredSection, ...fixedProjectSections()]
      : fixedProjectSections();
    if (!projectScrollArea || !projectSections.length) {
      return;
    }

    const paneScrolls = isProjectPaneScrollable();
    const atFullScroll = paneScrolls
      ? projectScrollArea.scrollTop >= projectScrollArea.scrollHeight - projectScrollArea.clientHeight - 2
      : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

    if (atFullScroll) {
      const finalHeading = projectSections[projectSections.length - 1].querySelector("h2");

      if (finalHeading) {
        setActiveProjectTab(`#${finalHeading.id}`);
      }

      return;
    }

    const viewportRect = paneScrolls
      ? projectScrollArea.getBoundingClientRect()
      : { top: 0, height: window.innerHeight };
    const viewportCenter = viewportRect.top + viewportRect.height / 2;
    const activeSection = projectSections.reduce((current, section) => {
      const currentRect = current.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const sectionContainsCenter =
        sectionRect.top <= viewportCenter && sectionRect.bottom >= viewportCenter;
      const currentContainsCenter =
        currentRect.top <= viewportCenter && currentRect.bottom >= viewportCenter;

      if (sectionContainsCenter && !currentContainsCenter) {
        return section;
      }

      if (sectionContainsCenter === currentContainsCenter) {
        const currentDistance = Math.abs(
          currentRect.top + currentRect.height / 2 - viewportCenter
        );
        const sectionDistance = Math.abs(
          sectionRect.top + sectionRect.height / 2 - viewportCenter
        );

        if (sectionDistance < currentDistance) {
          return section;
        }
      }

      return current;
    }, projectSections[0]);
    const heading = activeSection.querySelector("h2");

    if (heading) {
      setActiveProjectTab(`#${heading.id}`);
    }
  };

  getProjectTabs().forEach((tab) => {
    tab.addEventListener("click", (event) => {
      if (scrollToProjectSection(tab.hash)) {
        event.preventDefault();
        window.history.replaceState(null, "", tab.hash);
      }
    });
  });

  if (projectScrollArea) {
    let activeTabFrame = null;
    const queueActiveTabUpdate = () => {
      if (activeTabFrame) {
        return;
      }

      activeTabFrame = requestAnimationFrame(() => {
        updateActiveProjectTab();
        activeTabFrame = null;
      });
    };

    projectScrollArea.addEventListener("scroll", queueActiveTabUpdate);
    window.addEventListener("scroll", queueActiveTabUpdate);
    window.addEventListener("resize", queueActiveTabUpdate);
  }

  if (window.location.hash) {
    requestAnimationFrame(() => scrollToProjectSection(window.location.hash, "auto"));
  } else {
    requestAnimationFrame(() => {
      updateActiveProjectTab();
    });
  }

  const projectHeader = document.querySelector(".project-header");
  if (projectHeader) {
    const projects = [
      ...(content.researchProjects || []),
      ...(content.techProjects || []),
      ...(content.workProjects || []),
      ...(content.otherProjects || [])
    ];
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const currentProjectUrl = `projects/${pathParts[pathParts.length - 1]}`;
    const currentProject = projects.find(
      (project) => normalizeProjectUrl(project.url) === currentProjectUrl
    );
    const formattedDate = currentProject ? formatDate(getProjectDate(currentProject.url)) : "";

    if (formattedDate && !projectHeader.querySelector(".project-page-date")) {
      const dateElement = document.createElement("p");
      dateElement.className = "project-page-date";
      dateElement.textContent = `Last updated: ${formattedDate}`;
      projectHeader.appendChild(dateElement);
    }
  }
})();
