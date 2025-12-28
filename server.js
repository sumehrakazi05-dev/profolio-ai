const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const QRCode = require("qrcode");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Simple Authentication Route (Real-ish Login)
// Simple Authentication Route (Real-ish Login with Registration)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if it's the admin account
  if (email === "user@profolio.ai" && password === "password123") {
    return res.json({ success: true, message: "Login successful" });
  }

  // "Register" new users if they use a valid Gmail or GitHub email format
  // This simulates an open registration for specified domains
  // "Register" and Login for Gmail/GitHub accounts
  // This logic allows any email with these domains to 'register' and log in immediately
  const isGmail = email.includes('@gmail.com');
  const isGitHub = email.includes('github') || email.includes('@users.noreply.github.com');

  if ((isGmail || isGitHub) && password.length >= 6) {
    // In a real app, we would save this user to a DB. 
    // Here we auto-approve them to simulate "Making user register".
    return res.json({ success: true, message: "New account registered & logged in!" });
  }

  res.status(401).json({ success: false, message: "Invalid credentials. Use a Gmail or GitHub account to register." });
});

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize filename: remove spaces and unusual characters
    const sanitizedPath = (file.originalname || "upload").replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    cb(null, uniqueSuffix + "-" + sanitizedPath);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, PNG, and WEBP files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// In-memory storage for portfolio data (global store for demo)
let portfolioData = {};

// Helper to convert uploaded files to Base64 for portability
function fileToBase64(filename) {
  if (!filename) return null;
  const filePath = path.join(__dirname, "uploads", filename);
  if (!fs.existsSync(filePath)) return null;

  const fileBuffer = fs.readFileSync(filePath);
  const extension = path.extname(filename).toLowerCase().substring(1);
  let mimeType = "application/octet-stream";

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;
  } else if (extension === "pdf") {
    mimeType = "application/pdf";
  }

  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

// Helper to render template
function renderTemplate(data) {
  const templatePath = path.join(__dirname, "public", "templates", data.template || "minimal", "template.html");

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template '${data.template}' not found`);
  }

  let html = fs.readFileSync(templatePath, "utf8");

  // Font Family Mapping
  const fontMapping = {
    outfit: "'Outfit', sans-serif",
    inter: "'Inter', sans-serif",
    playfair: "'Playfair Display', serif"
  };
  const fontFamily = fontMapping[data.textStyle] || fontMapping.inter;

  // Common Styles Injection for cross-template compatibility and "Viewable" resume
  const commonStyles = `
    <!-- Enhanced Styles Injected by Generator -->
    <style>
      .profile-img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; }
      .profile-img-placeholder { width: 150px; height: 150px; background: #e2e8f0; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 2px dashed #94a3b8; }
      .profile-img-placeholder::after { content: '👤'; font-size: 3rem; opacity: 0.5; }
      
      .doc-btn { 
        display: inline-flex; 
        align-items: center; 
        gap: 12px; 
        padding: 14px 28px; 
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white !important; 
        text-decoration: none !important; 
        border-radius: 16px; 
        font-weight: 700; 
        margin: 10px 5px; 
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 10px 20px rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .doc-btn:hover { 
        transform: translateY(-4px) scale(1.02); 
        box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3);
        filter: brightness(1.1);
      }
      .doc-btn .icon { font-size: 1.4rem; }
      
      .project-img { 
        width: 100%; 
        height: 240px; 
        object-fit: cover; 
        border-radius: 16px; 
        margin-bottom: 24px; 
        border: 1px solid rgba(255,255,255,0.1);
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        display: block;
      }
      .project-img:hover {
        transform: scale(1.02);
      }
      
      .certificate-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 12px; }
      .certificate-list li a { 
        color: #6366f1; 
        text-decoration: none; 
        font-weight: 600; 
        padding: 10px 20px; 
        background: rgba(99, 102, 241, 0.05); 
        border: 1px solid rgba(99, 102, 241, 0.1);
        border-radius: 12px; 
        font-size: 0.95rem;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .certificate-list li a:hover { 
        background: rgba(99, 102, 241, 0.1); 
        border-color: #6366f1;
        transform: translateY(-2px);
      }

      /* Animations */
      @keyframes blurIn {
        from { filter: blur(10px); opacity: 0; transform: translateY(20px); }
        to { filter: blur(0); opacity: 1; transform: translateY(0); }
      }
      .blur-in { animation: blurIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
      
      .project-link {
        display: inline-block;
        margin-top: 15px;
        color: #6366f1 !important;
        text-decoration: none;
        font-weight: 600;
        transition: 0.3s;
      }
      .project-link:hover {
        padding-left: 5px;
      }
    </style>
  `;

  // Basic Replacements
  const replacements = {
    "{{name}}": data.name || "Your Name",
    "{{role}}": data.role || "Professional Role",
    "{{email}}": data.email || "",
    "{{phone}}": data.phone || "",
    "{{location}}": data.location || "",
    "{{about}}": data.about || "",
    "{{education}}": data.education || "",
    "{{cgpa}}": data.cgpa || "N/A",
    "{{experience}}": data.experience || "0",
    "{{achievements}}": data.achievements || "",
    "{{fontFamily}}": fontFamily
  };

  // Profile Image - Portability Fix
  const profileImageBase64 = fileToBase64(data.profileImage);
  if (profileImageBase64) {
    replacements["{{profileImage}}"] = `<img src="${profileImageBase64}" alt="${data.name}" class="profile-img">`;
  } else {
    replacements["{{profileImage}}"] = `<div class="profile-img-placeholder"></div>`;
  }

  // Skills
  const skillsList = Array.isArray(data.skills) ? data.skills : [];
  replacements["{{skills}}"] = skillsList.map(s => `<li>${s}</li>`).join("");

  // Projects - Portability Fix
  const projectsList = Array.isArray(data.projects) ? data.projects : [];
  let projectImageIndex = 0;
  replacements["{{projects}}"] = projectsList.map((p) => {
    let projectImageHTML = "";
    if (p.hasImage && data.projectImages && data.projectImages[projectImageIndex]) {
      const projectImageBase64 = fileToBase64(data.projectImages[projectImageIndex]);
      if (projectImageBase64) {
        projectImageHTML = `<img src="${projectImageBase64}" class="project-img" alt="${p.title}">`;
      }
      projectImageIndex++;
    }

    return `
      <div class="card project blur-in">
        ${projectImageHTML}
        <h4>${p.title}</h4>
        <p>${p.description}</p>
        ${p.link ? `<a href="${p.link}" target="_blank" class="project-link">Explore Case Study →</a>` : ""}
      </div>
    `;
  }).join("");

  // Resume - Portability Fix
  const resumeBase64 = fileToBase64(data.resume);
  replacements["{{resume}}"] = resumeBase64
    ? `<a href="${resumeBase64}" class="doc-btn" download="${data.name}-Resume${path.extname(data.resume)}">
         <span class="icon">📄</span> Download / View Resume
       </a>`
    : "";

  // Certificates - Portability Fix
  const certList = Array.isArray(data.certificates) ? data.certificates : [];
  replacements["{{certificates}}"] = `<ul class="certificate-list">` + certList.map(c => {
    const certBase64 = fileToBase64(c);
    if (!certBase64) return "";
    return `<li><a href="${certBase64}" download="Certificate-${c.split("-").slice(2).join("-")}">📜 ${c.split("-").slice(2).join("-")}</a></li>`;
  }).join("") + `</ul>`;

  // Apply replacements
  Object.keys(replacements).forEach(key => {
    const regex = new RegExp(key, "g");
    html = html.replace(regex, replacements[key]);
  });

  // Inject common styles before </head>
  html = html.replace("</head>", commonStyles + "\n</head>");

  return html;
}

// Create/Update portfolio data
app.post(
  "/create-portfolio",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
    { name: "projectImages", maxCount: 20 },
  ]),
  (req, res) => {
    try {
      const projects = JSON.parse(req.body.projects || "[]");
      const skills = JSON.parse(req.body.skills || "[]");

      const data = {
        ...req.body,
        skills,
        projects,
      };

      // Handle Files
      if (req.files) {
        if (req.files.profileImage) data.profileImage = req.files.profileImage[0].filename;
        if (req.files.resume) data.resume = req.files.resume[0].filename;
        if (req.files.certificates) {
          data.certificates = req.files.certificates.map(f => f.filename);
        }
        if (req.files.projectImages) {
          data.projectImages = req.files.projectImages.map(f => f.filename);
        }
      }

      // Preserve existing files if not re-uploaded
      if (portfolioData.name && !req.files.profileImage) data.profileImage = portfolioData.profileImage;
      if (portfolioData.name && !req.files.resume) data.resume = portfolioData.resume;
      if (portfolioData.name && !req.files.certificates) data.certificates = portfolioData.certificates;
      if (portfolioData.name && !req.files.projectImages) data.projectImages = portfolioData.projectImages;

      portfolioData = data;
      console.log(`✅ Portfolio updated for: ${data.name}`);
      res.json({ success: true, message: "Portfolio data updated" });
    } catch (error) {
      console.error("❌ Error creating portfolio:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Get raw data
app.get("/get-portfolio", (req, res) => {
  res.json(portfolioData);
});

// Preview Portfolio
app.get("/preview-portfolio", (req, res) => {
  try {
    if (!portfolioData.name) {
      return res.send("<div style='font-family: sans-serif; text-align: center; padding: 50px;'><h2>No portfolio data yet.</h2><p>Please complete at least step 1 of the wizard.</p></div>");
    }
    const html = renderTemplate(portfolioData);
    res.send(html);
  } catch (error) {
    res.status(500).send(`Error rendering preview: ${error.message}`);
  }
});

// Download Portfolio
app.get("/download-portfolio", (req, res) => {
  try {
    if (!portfolioData.name) {
      return res.status(400).json({ error: "No portfolio data found" });
    }
    const html = renderTemplate(portfolioData);

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${portfolioData.name.replace(/[^a-z0-9]/gi, "-")}-portfolio.html"`
    );
    res.send(html);
  } catch (error) {
    console.error("❌ Error generating download:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve Live Portfolio
app.get("/portfolio", (req, res) => {
  try {
    if (!portfolioData.name) {
      return res.send("<div style='font-family: sans-serif; text-align: center; padding: 50px; color: #fff; background: #0f172a; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;'><h2>No portfolio data yet.</h2><p>Please complete the wizard to generate your portfolio.</p><a href='/' style='color: #6366f1; margin-top: 20px;'>Go to Wizard</a></div>");
    }
    const html = renderTemplate(portfolioData);
    res.send(html);
  } catch (error) {
    res.status(500).send(`Error rendering portfolio: ${error.message}`);
  }
});

// Helper to get Local IP
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Generate Share Links & QR Code
app.get("/share", async (req, res) => {
  try {
    const protocol = req.protocol;
    const ip = getLocalIp();
    const port = PORT; // Use the active port

    // Construct URL using IP address so it works on mobile
    const url = `${protocol}://${ip}:${port}/portfolio`;

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(url, {
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      width: 300,
      margin: 2
    });

    res.json({ success: true, url, qrCode });
  } catch (error) {
    console.error("❌ Error generating QR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling for Multer and other errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  res.status(500).json({ error: error.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio Generator refined & ready!`);
  console.log(`✨ Interface: http://localhost:${PORT}`);
  console.log(`📁 File Storage: ${path.resolve("./uploads")}\n`);
});
