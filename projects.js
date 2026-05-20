window.siteContent = {
  // Optional per project: add highlight: true and highlightColor: "#2f6358"
  // to give a card a custom colored border.
  education: {
    details:
      "University of Western Ontario - Bachelor of Science, Specialization in Computer Science - 2026." 
  },
  contact: {
    email: "robin10125@gmail.com",
    github: "https://github.com/robin10125",
    twitter: "https://twitter.com/robin_hylands"
  },

  researchProjects: [
    {
      title: "Automating RLVR Environments",
      summary:
        "Early research into automating the RLVR pipeline by training models to generate the environments used for training. This page is a short stub for now and can expand as the project develops.",
      tags: ["RLVR", "Environment generation", "AutoML"],
      url: "projects/automating-rlvr-environments.html",
      highlight: true,
      highlightColor: "#b45309"
    },
    {
      title: "Byte Level Models and Word Level Features",
      summary:
        "A sparse autoencoder experiment testing whether a byte-level language model learns word-level features from character prediction. The project looks for selective features tied to specific words, then probes whether feature amplification can steer generation.",
      image: "assets/feature-activation-frequency.png",
      imageAlt: "Distribution of sparse autoencoder feature activation frequencies.",
      tags: ["SAEs", "Mechanistic interpretability", "Representation Learning"],
      url: "projects/character-word-features.html",
      highlight: true,
      highlightColor: "#b45309"

    },
    {
      title: "Predictive Coding Objectives",
      summary:
        "A modular architecture idea for scaling the number of training objectives by predicting future latent states. The current version explores residual-stream forks, cross-attention reintegration, and whether compressed prediction targets could make the objective more useful.",
      image: "assets/mpc.png",
      imageAlt: "Modular Predictive Coding Architecture.",
      tags: ["Predictive coding", "Architectures", "Representation learning"],
      url: "projects/predictive-coding-objectives.html",
      highlight: true,
      highlightColor: "#b45309"
    },
	
    {
      title: "Hyperconnections and Multi-Token Prediction",
      summary:
        "An experiment plan exploring whether hyperconnections can help models specialize under multi-token prediction objectives. The core comparison is between hyperconnection and residual models under next-token and multi-token training setups.",
      image: "assets/mhc-graph.png",
      imageAlt: "Graph comparing two different ML techniques.",
      tags: ["Architectures", "Objective Functions"],
      url: "projects/hyperconnections-mtp.html",
      highlight: true,
      highlightColor: "#b45309"
    },
  ],

  techProjects: [
    {
      title: "Full Stack Generative Images Website",
      summary:
        "Trained and deployed suite of GAN models (CycleGAN, Neural Style Transfer, Conditional InstanceNorm GAN) for photo-to-painting transformation using Tensorflow. Deployed models using Docker and TensorFlow ModelServer, achieving decent inference latency for almost no cost. Developed full-stack web application for users to upload photos, using a JavaScript front end and Node.js backend",
      tags: ["Full Stack App", "Machine Learning", "Model Training", "Computer Vision", "Generative Images", "Model Serving"],
      url: "projects/generative-images-website.html",
      highlight: true,
      highlightColor: "#b45309"

    },
    {
      title: "Algorithmic Social Matchmaking App",
      summary:
        "Designed novel matchmaking algorithm using LLM-generated embeddings and hierarchical clustering to create conversation groups for 100+ event attendees.  Developed feature extraction pipeline combining LLM theme analysis with TF-IDF to identify salient matching criteria, achieving much more effective results than traditional clustering algorithms for matchmaking. The key insight was to prioritize unique shared experiences using TF-IDF.",
      tags: ["Data Science", "Clustering", "TF-IDF", "Applied ML"],
      url: "projects/algorithmic-social-matchmaking-app.html",
      highlight: true,
      highlightColor: "#b45309"

    },
    {
      title: "Neural Network Framework in C++",
      summary:
        "A neural network framework inspired by PyTorch that allows basic model construction and training.  Neural Network operations and their backwards derivatives were designed and implemented, as well as a computational graph system for efficient training.  Implemented in C++",
      tags: ["Machine Learning", "Framework", "C++"],
      url: "projects/nn-framework-cpp.html",
      highlight: true,
      highlightColor: "#b45309"

    },
    {
      title: "Programmatic Video Generation",
      summary:
        "Generating and editing videos and design assets programatically using Claude Code and Codex.",
      tags: ["Programmatic Animation", "Programmatic Design"],
      url: "projects/algorithmic-video-generation.html"
    },
    {
      title: "Point and Click Adventure Game",
      summary:
        "Point and click adventure game for a school group project.  Implemented in Java.",
      tags: ["Object Oriented Programming", "Video Game", "Java"],
      url: "projects/point-and-click-game.html"
    },
    {
      title: "Alchemy Photowall",
      summary:
        "A photowall website where users can upload photos taken at an event to a photowall for that event.  Hosted using AWS.",
      tags: ["Full Stack", "AWS", "Community"],
      url: "projects/alchemy-photowall.html"
    },
    {
      title: "Pong RL Policy",
      summary:
        "Introductory project to learn the basics of RL.  Trained a Q network policy for the classic pong game.",
      tags: ["RL", "Q Learning"],
      url: "projects/pong.html"
    },
    {
      title: "Browser Based Shogi",
      summary:
        "A browser based Shogi Engine.",
      tags: ["Javascript"],
      url: "projects/shogi-website.html"
    },
    {
      title: "Bidmarket",
      summary:
        "Online auction platform.",
      tags: ["Full Stack", "Web Sockets"],
      url: "projects/bidmarket-website.html"
    },
    {
      title: "Neural Network Framework in Numpy",
      summary:
        "Basic dense neural network framework, serving as an introduction to machine learning and neural networks.  Implemented with numpy array operations and functions.",
      tags: ["Python", "Machine Learning"],
      url: "projects/numpy-neural-networks.html"
    },
    {
      title: "Robot Hand",
      summary:
        "Desinged from scratch and assembled a robotic hand with 3d printer and servos, as well as skin electrodes to allow control by muscle contraction.  Served as an introduction project to computer science.",
      tags: ["Robotics", "3d printing", "CAD"],
      url: "projects/robot-hand.html"
    },
    {
      title: "Many School Projects",
      summary:
        "I have done a wide assortment of small programs and projects as part of my courses.  These focus on algorithms and data structures, databases, operating systems, data science, object oritented programming, and machine learning.",
      tags: ["Data Structures", "Algorithms", "Databases", "Object Oriented Programming", "Operating Systems", "Data Science"],
      url: "projects/school-projects.html"
    },
  ],

  otherProjects: [
    {
      title: "Momentum",
      summary:
        "Co lead community group fostering collaboration and community building for the builders, hackers, founders and artists in the London area.  I help organize and host weekly co working events, workshops and showcases attended by hundreds of community members.",
      tags: ["Leadership", "Community"],
      url: "projects/momentum.html",
      image: "assets/momentum.png",
      imageAlt: "Distribution of sparse autoencoder feature activation frequencies.",
      highlight: true,
      highlightColor: "#b45309"

    },
    {
      title: "Alchemy",
      summary:
        "Alchemy is a large project demo day I co lead, with over 250 attendees (and more than 100% growth over the previous year), showcasing projects in the Momentum community.  This was a large a complex event, involving many thousands of dollars of funding and over 30 projects being showcased.",
      tags: ["Leadership", "Community"],
      url: "projects/alchemy.html",
      image: "assets/alchemy.png",
      imageAlt: "Distribution of sparse autoencoder feature activation frequencies.",
      highlight: true,
      highlightColor: "#b45309"

    }
  ]
};
