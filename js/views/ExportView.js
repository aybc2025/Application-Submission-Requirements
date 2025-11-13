/* ============================================
   EXPORTVIEW.JS - Export Options View
   CD-1 Rezoning Application Checker
   ============================================ */

export class ExportView {
  constructor(project) {
    this.project = project;
  }

  render() {
    const container = document.getElementById('app');
    
    container.innerHTML = `
      <div class="app-header">
        <div class="header-content">
          <div>
            <h1 class="header-title">${this.project.metadata.address || 'Rezoning Application'}</h1>
            <div class="header-subtitle">Export & Reports</div>
          </div>
          <div class="header-nav">
            <a href="#" class="nav-item" onclick="window.appController.showProfiler(); return false;">📝 Edit Profile</a>
            <a href="#" class="nav-item" onclick="window.appController.showChecklist(); return false;">✓ Checklist</a>
            <a href="#" class="nav-item" onclick="window.appController.showValidation(); return false;">📊 Validation</a>
            <a href="#" class="nav-item active" onclick="window.appController.showExport(); return false;">📤 Export</a>
            <a href="#" class="nav-item" onclick="window.appController.goToLanding(); return false;">🏠 Home</a>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="dashboard-container">
          <h2>Export & Reports</h2>
          <p class="text-muted">Generate reports and export your project data</p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px;">
            
            <div class="card" style="cursor: pointer;" onclick="window.exportManager.generatePDFReport()">
              <div style="font-size: 48px; text-align: center; margin-bottom: 16px;">📊</div>
              <h3 style="text-align: center; margin-bottom: 8px;">PDF Summary Report</h3>
              <p style="text-align: center; color: #666; font-size: 14px;">
                Complete project summary with all requirements, status, and completion percentage
              </p>
              <button class="btn btn-primary" style="width: 100%; margin-top: 16px;">
                Generate PDF
              </button>
            </div>

            <div class="card" style="cursor: pointer;" onclick="window.exportManager.generateDeficiencyLetter()">
              <div style="font-size: 48px; text-align: center; margin-bottom: 16px;">📋</div>
              <h3 style="text-align: center; margin-bottom: 8px;">Deficiency Letter</h3>
              <p style="text-align: center; color: #666; font-size: 14px;">
                Formal letter listing all missing items for the applicant
              </p>
              <button class="btn btn-primary" style="width: 100%; margin-top: 16px;">
                Generate Letter
              </button>
            </div>

            <div class="card" style="cursor: pointer;" onclick="window.exportManager.generatePrintableChecklist()">
              <div style="font-size: 48px; text-align: center; margin-bottom: 16px;">🖨️</div>
              <h3 style="text-align: center; margin-bottom: 8px;">Printable Checklist</h3>
              <p style="text-align: center; color: #666; font-size: 14px;">
                Simple checklist format for paper reference
              </p>
              <button class="btn btn-primary" style="width: 100%; margin-top: 16px;">
                Print Checklist
              </button>
            </div>

            <div class="card" style="cursor: pointer;" onclick="window.appController.exportJSON()">
              <div style="font-size: 48px; text-align: center; margin-bottom: 16px;">💾</div>
              <h3 style="text-align: center; margin-bottom: 8px;">Export JSON</h3>
              <p style="text-align: center; color: #666; font-size: 14px;">
                Save project data as JSON file for backup or transfer
              </p>
              <button class="btn btn-secondary" style="width: 100%; margin-top: 16px;">
                Export JSON
              </button>
            </div>

          </div>

          <div class="alert alert-info" style="margin-top: 40px;">
            <div class="alert-icon">ℹ️</div>
            <div class="alert-content">
              <div class="alert-title">About Reports</div>
              All reports are generated locally in your browser. No data is sent to any server. 
              Reports open in a new window where you can print or save them as PDF using your browser's print function.
            </div>
          </div>

          <div style="margin-top: 40px; padding: 24px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin-bottom: 16px;">Project Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Project Name</div>
                <div class="info-value">${this.project.metadata.projectName || 'Not specified'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">${this.project.metadata.address || 'Not specified'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Created</div>
                <div class="info-value">${new Date(this.project.metadata.createdDate).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Last Modified</div>
                <div class="info-value">${new Date(this.project.metadata.lastModified).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}
