/* ============================================
   LANDINGVIEW.JS - Landing Screen View
   CD-1 Rezoning Application Checker
   ============================================ */

import { Project } from '../models/Project.js';
import { Calculator } from '../utils/calculator.js';

export class LandingView {
  constructor() {
    this.recentProjects = Project.getRecentProjects();
  }

  render() {
    const container = document.getElementById('app');
    
    container.innerHTML = `
      <div class="app-header">
        <div class="header-content">
          <div>
            <h1 class="header-title">CD-1 Rezoning Application Checker</h1>
            <div class="header-subtitle">City of Vancouver</div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="landing-container">
          <div class="landing-hero">
            <h2 style="font-size: 32px; margin-bottom: 16px;">Welcome to the Rezoning Application Checker</h2>
            <p style="font-size: 18px; color: #666;">
              This tool helps you verify that your CD-1 rezoning application contains all required documents 
              and meets submission requirements according to the official City of Vancouver guide.
            </p>
          </div>

          <div class="landing-actions">
            <div class="landing-card" onclick="window.appController.createNewProject()">
              <div class="landing-card-icon">📝</div>
              <div class="landing-card-title">New Application</div>
              <p>Start checking a new rezoning application</p>
            </div>

            <div class="landing-card" onclick="window.appController.showLoadProject()">
              <div class="landing-card-icon">📂</div>
              <div class="landing-card-title">Load Saved</div>
              <p>Continue a previous application</p>
            </div>

            <div class="landing-card" onclick="window.appController.showImport()">
              <div class="landing-card-icon">📥</div>
              <div class="landing-card-title">Import JSON</div>
              <p>Import from a saved file</p>
            </div>
          </div>

          ${this.renderRecentProjects()}

          <div style="margin-top: 60px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin-bottom: 16px;">📚 Help Resources</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <a href="#" onclick="window.appController.showHelp('guide'); return false;" style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-decoration: none; color: inherit;">
                <div style="font-weight: 600; margin-bottom: 4px;">📖 Quick Start Guide</div>
                <div style="font-size: 14px; color: #666;">Learn how to use this tool</div>
              </a>
              <a href="#" onclick="window.appController.showHelp('video'); return false;" style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-decoration: none; color: inherit;">
                <div style="font-weight: 600; margin-bottom: 4px;">🎥 Video Tutorial</div>
                <div style="font-size: 14px; color: #666;">Watch a walkthrough</div>
              </a>
              <a href="#" onclick="window.appController.showHelp('faq'); return false;" style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-decoration: none; color: inherit;">
                <div style="font-weight: 600; margin-bottom: 4px;">❓ FAQ</div>
                <div style="font-size: 14px; color: #666;">Common questions</div>
              </a>
              <a href="mailto:rezoning@vancouver.ca" style="padding: 12px; background: #f8f9fa; border-radius: 8px; text-decoration: none; color: inherit;">
                <div style="font-weight: 600; margin-bottom: 4px;">📧 Contact Support</div>
                <div style="font-size: 14px; color: #666;">Get help from staff</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRecentProjects() {
    if (this.recentProjects.length === 0) {
      return '';
    }

    return `
      <div class="recent-projects">
        <h3 style="margin-bottom: 16px;">Recent Applications</h3>
        ${this.recentProjects.map(project => `
          <div class="recent-project-item" onclick="window.appController.loadProject('${project.projectId}')">
            <div>
              <div style="font-weight: 600;">${project.projectName || project.address}</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">
                ${project.address} • ${project.completionPercentage}% complete
              </div>
              <div style="font-size: 13px; color: #999; margin-top: 4px;">
                Last modified: ${Calculator.formatDate(project.lastModified, 'relative')}
              </div>
            </div>
            <div>
              <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); window.appController.deleteProject('${project.projectId}')">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}
