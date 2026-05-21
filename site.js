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

  const educationDetails = document.getElementById("education-details");
  if (educationDetails && content.education?.details) {
    educationDetails.textContent = content.education.details;
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
    const highlightColor = project.highlightColor || project.highlightColour || "#2f6358";
    const cardClass = [
      "project-card",
      project.image ? "" : "text-only-card",
      isHighlighted ? "highlighted-card" : ""
    ]
      .filter(Boolean)
      .join(" ");
    const highlightStyle = isHighlighted ? ` style="--highlight-color: ${highlightColor};"` : "";

    return `
      <a class="${cardClass}" href="${project.url}"${highlightStyle}>
        ${image}
        <div class="card-body">
          <h3>${project.title}</h3>
          ${dateMarkup}
          <p>${project.summary}</p>
          ${tags}
        </div>
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

  renderCards("research-projects", content.researchProjects || []);
  renderStableColumns("tech-projects", content.techProjects || []);
  renderStableColumns("other-projects", content.otherProjects || []);

  const projectHeader = document.querySelector(".project-header");
  if (projectHeader) {
    const projects = [
      ...(content.researchProjects || []),
      ...(content.techProjects || []),
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
