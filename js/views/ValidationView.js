/* ============================================
   VALIDATIONVIEW.JS - Validation Dashboard View
   CD-1 Rezoning Application Checker
   ============================================ */

export class ValidationView {
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
            <div class="header-subtitle">Validation Dashboard</div>
          </div>
          <div class="header-nav">
            <a href="#" class="nav-item" onclick="window.appController.showProfiler(); return false;">📝 Edit Profile</a>
            <a href="#" class="nav-item" onclick="window.appController.showChecklist(); return false;">✓ Checklist</a>
            <a href="#" class="nav-item active" onclick="window.appController.showValidation(); return false;">📊 Validation</a>
            <a href="#" class="nav-item" onclick="window.appController.showExport(); return false;">📤 Export</a>
            <a href="#" class="nav-item" onclick="window.appController.goToLanding(); return false;">🏠 Home</a>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div id="validationDashboard">
          <!-- Dashboard content rendered by controller -->
        </div>
      </div>
    `;
  }
}
