window.siteContent = {
  // Optional per project: add highlight: true and highlightColor: "#2f6358"
  // to give a card a custom colored border. Add featured: true to make a
  // card visually larger in the homepage section layout.
  education: {
    details:
      "University of Western Ontario - Bachelor of Science, Specialization in Computer Science - 2026." 
  },
  about: {
    details: [
      "I love nature, hard problems, machine learning, and staying active.  My goal is to make the world a better place.",
	"Machine Learning combines what I love about nature and biology --magic of life-- with what I love about computer science --problem solving and openness.",
	"You can usually find me creating experiments, swing dancing, reading, working out, and solving life's mysteries."		
    ],
  },
  skills: [
    "Machine Learning",
    "Computer Science",
    "Data Science",
    "C++",
    "Python",
    "Java",
    "Mathematics",
    "Full Stack Web Development",
    "Community Building",
  ],
  skillTagMap: {
    "RLVR": ["Machine Learning"],
    "Environment generation": ["Machine Learning"],
    "AutoML": ["Machine Learning"],
    "Architectures": ["Machine Learning"],
    "Objective Functions": ["Machine Learning"],
    "SAEs": ["Machine Learning"],
    "Mechanistic interpretability": ["Machine Learning"],
    "Representation Learning": ["Machine Learning"],
    "Representation learning": ["Machine Learning"],
    "Predictive coding": ["Machine Learning"],
    "Model Training": ["Machine Learning"],
    "Computer Vision": ["Machine Learning"],
    "Generative Images": ["Machine Learning"],
    "Model Serving": ["Machine Learning"],
    "Applied ML": ["Machine Learning", "Data Science"],
    "Clustering": ["Machine Learning", "Data Science"],
    "TF-IDF": ["Machine Learning", "Data Science"],
    "Framework": ["Computer Science"],
    "Programmatic Animation": ["Computer Science"],
    "Programmatic Design": ["Computer Science"],
    "Object Oriented Programming": ["Computer Science", "Java"],
    "Video Game": ["Computer Science"],
    "Full Stack App": ["Full Stack Web Development", "Computer Science"],
    "Full Stack": ["Full Stack Web Development", "Computer Science"],
    "AWS": ["Full Stack Web Development", "Computer Science"],
    "Web Sockets": ["Full Stack Web Development", "Computer Science"],
    "Javascript": ["Full Stack Web Development", "Computer Science"],
    "RL": ["Machine Learning", "Computer Science"],
    "Q Learning": ["Machine Learning", "Computer Science"],
    "Robotics": ["Computer Science"],
    "3d printing": ["Computer Science"],
    "CAD": ["Computer Science"],
    "Data Structures": ["Computer Science"],
    "Algorithms": ["Computer Science"],
    "Databases": ["Computer Science"],
    "Operating Systems": ["Computer Science", "C++"],
    "Automatic Speech Recognition": ["Machine Learning", "Computer Science"],
    "RAG": ["Machine Learning", "Computer Science"],
    "Leadership": ["Community Building"],
    "Community": ["Community Building"]
  },
  skillProjectMap: {
    Python: [
      "projects/automating-rlvr-environments.html",
      "projects/hyperconnections-mtp.html",
      "projects/character-word-features.html",
      "projects/predictive-coding-objectives.html",
      "projects/generative-images-website.html",
      "projects/algorithmic-social-matchmaking-app.html",
      "projects/algorithmic-video-generation.html",
      "projects/pong.html",
      "projects/numpy-neural-networks.html",
      "projects/school-projects.html",
      "projects/work-projects.html"
    ],
    "Full Stack Web Development": [
      "projects/school-projects.html"
    ],
    "Machine Learning": [
      "projects/school-projects.html"
    ],
    "C++": [
      "projects/robot-hand.html",
      "projects/school-projects.html"
    ],
    Mathematics: [
      "projects/school-projects.html",
      "projects/generative-images-website.html",
      "projects/nn-framework-cpp.html",
      "projects/numpy-neural-networks.html"
    ]
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
        "Research project into recursive super intelligence by treating models improving themselves as a skill, and optimizing this ability explicitly.  In other words, training models to train models.  So far I have tested and improved a small framework for this kind of bi level optimization problem with maze games and RL agents.  I am now experimenting with training models to do the EUREKA framework more efficevly by treating downstream performance within the EUREKA framework as a learning signal for the code models generating shaped rewards.",
      tags: ["RLVR", "Environment generation", "AutoML"],
      url: "projects/automating-rlvr-environments.html",
      highlight: true,
      highlightColor: "#b45309",
      featured: true
    },
    {
      title: "Hyperconnections and Multi-Token Prediction",
      summary:
        "An experiment plan exploring whether hyperconnections can help models specialize under multi-token prediction objectives. The core comparison is between hyperconnection and residual models under next-token and multi-token training setups.  I have confirmed that these techniques simply add their efficiency gains together (the null hypothesis), and I have now pvioted this project to focus in improving the efficiency of these algorithms so that they can match the reported performance reported in the literature.  To this end I am developing my CUDA/XLA and distributed training skills.",
      tags: ["Architectures", "Objective Functions"],
      url: "projects/hyperconnections-mtp.html",
      highlight: true,
      highlightColor: "#b45309",
      featured: true
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
  ],

  techProjects: [
    {
      title: "Full Stack Generative Images Website",
      summary:
        "Trained and deployed suite of GAN models (CycleGAN, Neural Style Transfer, Conditional InstanceNorm GAN) for photo-to-painting transformation using Tensorflow. Deployed models using Docker and TensorFlow ModelServer, achieving decent inference latency for almost no cost. Developed full-stack web application for users to upload photos, using a JavaScript front end and Node.js backend",
      tags: ["Full Stack App", "Machine Learning", "Model Training", "Computer Vision", "Generative Images", "Model Serving"],
      url: "projects/generative-images-website.html",
      highlight: true,
      highlightColor: "#b45309",
      featured: true

    },
    {
      title: "Algorithmic Social Matchmaking App",
      summary:
        "Designed novel matchmaking algorithm using LLM-generated embeddings and hierarchical clustering to create conversation groups for 100+ event attendees.  Developed feature extraction pipeline combining LLM theme analysis with TF-IDF to identify salient matching criteria, achieving much more effective results than traditional clustering algorithms for matchmaking. The key insight was to prioritize unique shared experiences using TF-IDF.",
      tags: ["Data Science", "Clustering", "TF-IDF", "Applied ML"],
      url: "projects/algorithmic-social-matchmaking-app.html",
      highlight: true,
      highlightColor: "#b45309",
      featured: true

    },
    {
      title: "Neural Network Framework in C++",
      summary:
        "A neural network framework inspired by PyTorch that allows basic model construction and training.  Neural Network operations and their backwards derivatives were designed and implemented, as well as a computational graph system for efficient training.  Implemented in C++",
      tags: ["Machine Learning", "Framework", "C++"],
      url: "projects/nn-framework-cpp.html",
      highlight: true,
      highlightColor: "#b45309",
      featured: true

    },
    {
      title: "Programmatic Video Generation",
      summary:
        "Generating and editing videos and design assets programmatically using Claude Code and Codex.",
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
        "Designed from scratch and assembled a robotic hand with 3d printer and servos, as well as skin electrodes to allow control by muscle contraction.  Served as an introduction project to computer science.",
      tags: ["Robotics", "3d printing", "CAD"],
      url: "projects/robot-hand.html"
    },
    {
      title: "NN Microscope",
      summary:
        "An educational neural network visualizer for stepping through forward passes, backpropagation, gradients, and optimizer updates.",
      tags: ["Javascript", "Machine Learning"],
      url: "projects/nn-microscope.html"
    },
    {
      title: "Many School Projects",
      summary:
        "I have done a wide assortment of small programs and projects as part of my courses.  These focus on algorithms and data structures, databases, operating systems, data science, object oriented programming, and machine learning.",
      tags: ["Data Structures", "Algorithms", "Databases", "Object Oriented Programming", "Operating Systems", "Data Science", "Mathematics"],
      url: "projects/school-projects.html"
    },
  ],

  workProjects: [
    {
      title: "R&D with JCHylands Consulting",
      summary:
        "Worked on automated transcription and neural embedding search R&D projects.",
      tags: ["Automatic Speech Recognition", "RAG"],
      url: "projects/work-projects.html"
    }
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
