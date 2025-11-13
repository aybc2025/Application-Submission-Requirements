/* ============================================
   APP.JS - Main Application Entry Point
   CD-1 Rezoning Application Checker
   ============================================ */

import { Project } from './models/Project.js';
import { LandingView } from './views/LandingView.js';
import { ProfilerView } from './views/ProfilerView.js';
import { ChecklistView } from './views/ChecklistView.js';
import { ValidationView } from './views/ValidationView.js';
import { ExportView } from './views/ExportView.js';
import { ProfilerController } from './controllers/ProfilerController.js';
import { ChecklistController } from './controllers/ChecklistController.js';
import { ValidationController } from './controllers/ValidationController.js';
import { ExportManager } from './utils/export.js';
import { Modal } from './components/Modal.js';
import { FileUploader } from './components/FileUploader.js';

class AppController {
  constructor() {
    this.currentProject = null;
    this.requirements = null;
    this.currentView = null;
    this.profilerController = null;
    this.checklistController = null;
    this.validationController = null;
  }

  async init() {
    try {
      // Load requirements data
      const response = await fetch('data/requirements.json');
      if (!response.ok) {
        throw new Error(`Failed to load requirements: ${response.statusText}`);
      }
      const requirementsData = await response.json();
      
      // Keep as object (RequirementsEngine expects object format)
      this.requirements = requirementsData;
      
      // Make exportManager available globally
      window.exportManager = ExportManager;
      
      // Show landing page
      this.goToLanding();
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError('Failed to load application data. Please refresh the page.');
    }
  }

  goToLanding() {
    const view = new LandingView();
    view.render();
    this.currentView = 'landing';
    this.currentProject = null;
    this.profilerController = null;
    this.checklistController = null;
    this.validationController = null;
  }

  createNewProject() {
    this.currentProject = new Project();
    this.showProfiler();
  }

  showProfiler() {
    if (!this.currentProject) {
      this.currentProject = new Project();
    }

    const view = new ProfilerView(this.currentProject);
    view.render();
    
    this.profilerController = new ProfilerController(this.currentProject);
    this.profilerController.initialize();
    
    window.profilerController = this.profilerController;
    this.currentView = 'profiler';
  }

  showChecklist() {
    if (!this.currentProject) {
      this.createNewProject();
      return;
    }

    const view = new ChecklistView(this.currentProject);
    view.render();
    
    this.checklistController = new ChecklistController(this.currentProject, this.requirements);
    window.checklistController = this.checklistController;
    this.currentView = 'checklist';
  }

  showValidation() {
    if (!this.currentProject) {
      this.createNewProject();
      return;
    }

    const view = new ValidationView(this.currentProject);
    view.render();
    
    this.validationController = new ValidationController(this.currentProject, this.requirements);
    window.validationController = this.validationController;
    this.currentView = 'validation';
  }

  showExport() {
    if (!this.currentProject) {
      this.createNewProject();
      return;
    }

    const view = new ExportView(this.currentProject);
    view.render();
    this.currentView = 'export';
  }

  loadProject(projectId) {
    const project = Project.load(projectId);
    if (project) {
      this.currentProject = project;
      this.showChecklist();
    } else {
      alert('Project not found');
    }
  }

  showLoadProject() {
    const recentProjects = Project.getRecentProjects();
    
    if (recentProjects.length === 0) {
      alert('No saved projects found');
      return;
    }

    let optionsHTML = recentProjects.map(project => 
      `<option value="${project.projectId}">${project.projectName || project.address} - ${project.completionPercentage}% complete</option>`
    ).join('');

    const modal = new Modal({
      title: 'Load Project',
      content: `
        <div class="form-group">
          <label for="projectSelect">Select a project:</label>
          <select id="projectSelect" class="form-control" style="width: 100%; margin-bottom: 16px;">
            ${optionsHTML}
          </select>
        </div>
      `,
      buttons: [
        {
          text: 'Cancel',
          class: 'btn-secondary',
          onclick: () => modal.close()
        },
        {
          text: 'Load',
          class: 'btn-primary',
          onclick: () => {
            const select = document.getElementById('projectSelect');
            if (select && select.value) {
              this.loadProject(select.value);
              modal.close();
            }
          }
        }
      ]
    });
    
    modal.show();
  }

  showImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const project = await Project.importJSON(file);
        this.currentProject = project;
        project.save();
        this.showChecklist();
      } catch (error) {
        alert('Error importing project: ' + error.message);
      }
    };
    
    input.click();
  }

  exportJSON() {
    if (!this.currentProject) {
      alert('No project to export');
      return;
    }
    this.currentProject.exportJSON();
  }

  async generatePDFReport() {
    if (!this.currentProject || !this.requirements) {
      alert('No project data available');
      return;
    }
    
    const { RequirementsEngine } = await import('./utils/validation.js');
    const engine = new RequirementsEngine(this.requirements, this.currentProject.profile);
    const result = engine.getApplicableRequirements();
    
    ExportManager.generatePDFReport(this.currentProject, this.requirements, result.applicable);
  }

  async generateDeficiencyLetter() {
    if (!this.currentProject || !this.requirements) {
      alert('No project data available');
      return;
    }
    
    const { RequirementsEngine } = await import('./utils/validation.js');
    const engine = new RequirementsEngine(this.requirements, this.currentProject.profile);
    const result = engine.getApplicableRequirements();
    
    ExportManager.generateDeficiencyLetter(this.currentProject, this.requirements, result.applicable);
  }

  async generatePrintableChecklist() {
    if (!this.currentProject || !this.requirements) {
      alert('No project data available');
      return;
    }
    
    const { RequirementsEngine } = await import('./utils/validation.js');
    const engine = new RequirementsEngine(this.requirements, this.currentProject.profile);
    const result = engine.getApplicableRequirements();
    
    ExportManager.generatePrintableChecklist(result.applicable, this.currentProject);
  }

  deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
      Project.deleteProject(projectId);
      this.goToLanding();
    }
  }

  showHelp(type) {
    const helpContent = {
      guide: {
        title: 'Quick Start Guide',
        content: `
          <h3>Getting Started</h3>
          <ol>
            <li>Click "New Application" to start a new project</li>
            <li>Fill out the project profile with site details</li>
            <li>Review the checklist of requirements</li>
            <li>Mark items as complete as you work through them</li>
            <li>Use the Validation view to see overall progress</li>
            <li>Export your project when ready</li>
          </ol>
        `
      },
      video: {
        title: 'Video Tutorial',
        content: `
          <p>Video tutorials are coming soon!</p>
          <p>For now, please refer to the Quick Start Guide or contact support.</p>
        `
      },
      faq: {
        title: 'Frequently Asked Questions',
        content: `
          <h3>Common Questions</h3>
          <p><strong>Q: How do I save my progress?</strong></p>
          <p>A: Your project is automatically saved as you work. You can also export it as JSON for backup.</p>
          
          <p><strong>Q: Can I edit a requirement after marking it complete?</strong></p>
          <p>A: Yes, you can change the status of any requirement at any time.</p>
          
          <p><strong>Q: What if I'm not sure if a requirement applies?</strong></p>
          <p>A: The system automatically determines which requirements apply based on your project profile. Items marked as "Not Applicable" won't affect your completion percentage.</p>
        `
      }
    };

    const help = helpContent[type] || helpContent.guide;
    
    const modal = new Modal({
      title: help.title,
      content: help.content,
      buttons: [
        {
          text: 'Close',
          class: 'btn-primary',
          onclick: () => modal.close()
        }
      ]
    });
    
    modal.show();
  }

  showError(message) {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="loading-screen">
        <div style="color: #dc3545; font-size: 24px; margin-bottom: 16px;">⚠️</div>
        <p style="color: #dc3545; font-size: 18px;">${message}</p>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 16px;">Reload Page</button>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  window.appController = app;
  app.init();
});
