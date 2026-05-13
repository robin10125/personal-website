(function () {
  const content = window.siteContent;

  if (!content) {
    return;
  }

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
})();
