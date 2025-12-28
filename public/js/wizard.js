// Wizard State Management
let currentStep = 1;
const totalSteps = 6;
let skillsArray = [];
let projectsArray = [];

// Initialize wizard
document.addEventListener('DOMContentLoaded', function () {
  updateProgress();
  addProject(); // Add first project by default
});

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle('light');
  const icon = document.getElementById('themeIcon');
  icon.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
}

// Navigation Functions
function nextStep() {
  if (validateStep(currentStep)) {
    if (currentStep < totalSteps) {
      currentStep++;
      updateWizard();
      if (currentStep === 6) {
        populateReview();
      }
    }
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    updateWizard();
  }
}

function updateWizard() {
  // Update step visibility
  document.querySelectorAll('.wizard-step').forEach(step => {
    step.classList.remove('active');
  });
  document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');

  // Update step indicators
  document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
    indicator.classList.remove('active', 'completed');
    if (index + 1 < currentStep) {
      indicator.classList.add('completed');
      indicator.textContent = '';
    } else if (index + 1 === currentStep) {
      indicator.classList.add('active');
      indicator.textContent = index + 1;
    } else {
      indicator.textContent = index + 1;
    }
  });

  // Update step labels
  document.querySelectorAll('.step-labels .step-label').forEach((label, index) => {
    label.classList.remove('active');
    if (index + 1 === currentStep) {
      label.classList.add('active');
    }
  });

  // Update progress line
  updateProgress();

  // Update buttons
  updateButtons();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const progressLine = document.getElementById('progressLine');
  if (progressLine) progressLine.style.width = progress + '%';
}

function updateButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Show/hide previous button
  prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';

  // Show/hide next and submit buttons
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-flex';
  } else {
    nextBtn.style.display = 'inline-flex';
    submitBtn.style.display = 'none';
  }
}

// Validation Functions
function validateStep(step) {
  let isValid = true;
  let errorMessage = '';

  switch (step) {
    case 1:
      const name = document.getElementById('name').value.trim();
      const role = document.getElementById('role').value.trim();
      const email = document.getElementById('email').value.trim();
      const about = document.getElementById('about').value.trim();

      if (!name || !role || !email || !about) {
        errorMessage = 'Please fill in all required fields (Name, Role, Email, About Me)';
        isValid = false;
      } else if (!isValidEmail(email)) {
        errorMessage = 'Please enter a valid email address';
        isValid = false;
      }
      break;

    case 2:
      const education = document.getElementById('education').value.trim();
      if (skillsArray.length === 0) {
        errorMessage = 'Please add at least one skill';
        isValid = false;
      } else if (!education) {
        errorMessage = 'Please enter your education details';
        isValid = false;
      }
      break;

    case 3:
      const projectItems = document.querySelectorAll('.project-item');
      if (projectItems.length === 0) {
        errorMessage = 'Please add at least one project';
        isValid = false;
      } else {
        let allValid = true;
        projectItems.forEach(project => {
          const title = project.querySelector('input[name="projectTitle"]').value.trim();
          const description = project.querySelector('textarea[name="projectDescription"]').value.trim();
          if (!title || !description) allValid = false;
        });
        if (!allValid) {
          errorMessage = 'Please fill in required project fields';
          isValid = false;
        }
      }
      break;

    case 4:
      if (!document.getElementById('template').value) {
        errorMessage = 'Please select a template';
        isValid = false;
      }
      break;

    case 5:
      if (!document.getElementById('textStyle').value) {
        errorMessage = 'Please select a text style';
        isValid = false;
      }
      break;
  }

  if (!isValid) alert(errorMessage);
  return isValid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Skills Management
function addSkill(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const skillInput = document.getElementById('skillInput');
    const skill = skillInput.value.trim();
    if (skill && !skillsArray.includes(skill)) {
      skillsArray.push(skill);
      renderSkills();
      skillInput.value = '';
    }
  }
}

function removeSkill(skill) {
  skillsArray = skillsArray.filter(s => s !== skill);
  renderSkills();
}

function renderSkills() {
  const container = document.getElementById('skillsContainer');
  container.innerHTML = skillsArray.map(skill => `
    <div class="skill-tag">
      ${skill}
      <button type="button" onclick="removeSkill('${skill}')">×</button>
    </div>
  `).join('');
}

// Projects Management
let projectCounter = 0;
function addProject() {
  projectCounter++;
  const container = document.getElementById('projectsContainer');
  const projectDiv = document.createElement('div');
  projectDiv.className = 'project-item';
  projectDiv.dataset.id = projectCounter;

  projectDiv.innerHTML = `
    <button type="button" class="remove-project" onclick="removeProject(${projectCounter})">×</button>
    <div class="form-group">
      <label>Project Title *</label>
      <input type="text" name="projectTitle" placeholder="e.g., E-commerce Website" required>
    </div>
    <div class="form-group">
      <label>Project Description *</label>
      <textarea name="projectDescription" placeholder="Describe your project..." required></textarea>
    </div>
    <div class="form-group">
      <label>Project Link (Optional)</label>
      <input type="url" name="projectLink" placeholder="https://github.com/...">
    </div>
    <div class="form-group">
      <label>Project Screenshot (Optional)</label>
      <div class="file-upload-wrapper">
        <label class="file-upload-label">
          🖼️ Upload Screenshot
          <div class="file-name" id="projectImageName_${projectCounter}"></div>
        </label>
        <input type="file" name="projectImage" accept="image/*" onchange="updateProjectFileName(${projectCounter})">
      </div>
    </div>
  `;
  container.appendChild(projectDiv);
}

function removeProject(id) {
  const project = document.querySelector(`.project-item[data-id="${id}"]`);
  if (project) project.remove();
}

// Selections
function selectTemplate(templateId) {
  document.querySelectorAll('.template-card').forEach(card => card.classList.remove('selected'));
  document.querySelector(`.template-card.${templateId}`).classList.add('selected');
  document.getElementById('template').value = templateId;
}

function selectTextStyle(styleId) {
  document.querySelectorAll('.style-card').forEach(card => card.classList.remove('selected'));
  const selectedCard = document.querySelector(`.style-card.style-${styleId}`);
  if (selectedCard) selectedCard.classList.add('selected');
  document.getElementById('textStyle').value = styleId;
}

// AI About Me
function generateAIAbout() {
  const name = document.getElementById('name').value.trim();
  const role = document.getElementById('role').value.trim();
  if (!name || !role) {
    alert('Name and Role are required');
    return;
  }
  const skillsText = skillsArray.length > 0 ? skillsArray.slice(0, 5).join(', ') : 'modern technologies';
  document.getElementById('about').value = `Hi, I'm ${name}, a dedicated ${role} specializing in ${skillsText}. I focus on creating seamless digital experiences and robust back-end systems. My goal is to combine technical brilliance with aesthetic design to deliver products that resonate with users.`;
}

// File Labels
function updateFileName(inputId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(inputId + 'FileName');
  if (input.files.length > 0) {
    display.textContent = input.files.length === 1 ? `✓ ${input.files[0].name}` : `✓ ${input.files.length} files`;
  } else {
    display.textContent = '';
  }
}

function updateProjectFileName(id) {
  const input = document.querySelector(`.project-item[data-id="${id}"] input[name="projectImage"]`);
  const display = document.getElementById(`projectImageName_${id}`);
  if (input.files.length > 0) {
    display.textContent = `✓ ${input.files[0].name}`;
  } else {
    display.textContent = '';
  }
}

// --- Data Collection Helper ---
function getFormData() {
  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('role', document.getElementById('role').value);
  formData.append('email', document.getElementById('email').value);
  formData.append('phone', document.getElementById('phone').value);
  formData.append('location', document.getElementById('location').value);
  formData.append('about', document.getElementById('about').value);
  formData.append('skills', JSON.stringify(skillsArray));
  formData.append('education', document.getElementById('education').value);
  formData.append('cgpa', document.getElementById('cgpa').value);
  formData.append('experience', document.getElementById('experience').value);
  formData.append('achievements', document.getElementById('achievements').value);
  formData.append('template', document.getElementById('template').value);
  formData.append('textStyle', document.getElementById('textStyle').value);

  const projects = [];
  document.querySelectorAll('.project-item').forEach((item, index) => {
    const title = item.querySelector('input[name="projectTitle"]').value;
    const description = item.querySelector('textarea[name="projectDescription"]').value;
    const link = item.querySelector('input[name="projectLink"]').value;
    const imageInput = item.querySelector('input[name="projectImage"]');

    let hasImage = false;
    if (imageInput.files.length > 0) {
      formData.append('projectImages', imageInput.files[0]);
      hasImage = true;
    }

    if (title || description) {
      projects.push({ title, description, link, hasImage });
    }
  });
  formData.append('projects', JSON.stringify(projects));

  const profileImage = document.getElementById('profileImage').files[0];
  if (profileImage) formData.append('profileImage', profileImage);

  const resume = document.getElementById('resume').files[0];
  if (resume) formData.append('resume', resume);

  const certs = document.getElementById('certificates').files;
  for (let i = 0; i < certs.length; i++) formData.append('certificates', certs[i]);

  return formData;
}

// --- Async Review & Preview ---
async function populateReview() {
  const reviewContent = document.getElementById('reviewContent');
  const previewLoading = document.querySelector('.preview-loading');
  const previewFrame = document.getElementById('portfolioPreviewFrame');

  if (previewLoading) {
    previewLoading.style.display = 'flex';
    previewLoading.style.opacity = '1';
  }
  previewFrame.src = 'about:blank';

  try {
    const formData = getFormData();
    const response = await fetch('/create-portfolio', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      previewFrame.src = '/preview-portfolio';
      previewFrame.onload = () => {
        if (previewLoading) {
          previewLoading.style.opacity = '0';
          setTimeout(() => { previewLoading.style.display = 'none'; }, 500);
        }
      };
    } else {
      throw new Error('Server returned error');
    }
  } catch (error) {
    console.error('Preview Error:', error);
    if (previewLoading) previewLoading.innerHTML = `<p style="color: #f43f5e;">Failed to load preview. Please try again.</p>`;
  }

  // Summary Table
  const template = document.getElementById('template').value;
  const hasProfile = document.getElementById('profileImage').files.length > 0 || portfolioData.profileImage;
  const hasResume = document.getElementById('resume').files.length > 0 || portfolioData.resume;

  reviewContent.innerHTML = `
    <div class="review-section">
      <h3>📁 Setup Summary</h3>
      <div class="review-grid">
        <div class="review-card"><label>Identity</label><span>${document.getElementById('name').value}</span></div>
        <div class="review-card"><label>Selected Template</label><span style="text-transform: capitalize;">${template}</span></div>
        <div class="review-card"><label>Typography</label><span style="text-transform: capitalize;">${document.getElementById('textStyle').value}</span></div>
        <div class="review-card"><label>Profile Photo</label><span>${hasProfile ? '✅ Attached' : '❌ Missing'}</span></div>
        <div class="review-card"><label>Resume/CV</label><span>${hasResume ? '✅ Attached' : '❌ Missing'}</span></div>
      </div>
    </div>
  `;
}

// --- Final Submission (Download) ---
// --- Final Submission (Live & Download) ---
async function submitForm() {
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading"></span> Finalizing...';

  try {
    // 1. Save Portfolio Data
    const formData = getFormData();
    const saveResponse = await fetch('/create-portfolio', { method: 'POST', body: formData });

    if (!saveResponse.ok) throw new Error("Failed to save portfolio");

    // 2. Generate Share Link & QR
    const shareResponse = await fetch('/share');
    const shareData = await shareResponse.json();

    if (!shareData.success) throw new Error("Failed to generate share data");

    // 3. Populate and Show Modal
    const modal = document.getElementById('successModal');
    const qrImage = document.getElementById('qrCodeImage');
    const linkBox = document.getElementById('portfolioLink');
    const viewBtn = document.getElementById('viewLiveBtn');

    qrImage.src = shareData.qrCode;
    linkBox.textContent = shareData.url;
    viewBtn.href = shareData.url;

    modal.classList.add('active');

    // Reset button state slightly to indicate success
    submitBtn.innerHTML = '✨ Success!';

  } catch (error) {
    console.error('Final Submission Error:', error);
    alert('Oops! Something went wrong. Please check your connection.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('active');

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = false;
  submitBtn.innerHTML = '🚀 Generate Portfolio';
}
