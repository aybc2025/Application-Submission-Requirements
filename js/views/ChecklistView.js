/* ============================================
   CHECKLISTVIEW.JS - Checklist View
   CD-1 Rezoning Application Checker
   ============================================ */

export class ChecklistView {
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
            <div class="header-subtitle">Requirements Checklist</div>
          </div>
          <div class="header-nav">
            <a href="#" class="nav-item" onclick="window.appController.showProfiler(); return false;">📝 Edit Profile</a>
            <a href="#" class="nav-item active" onclick="window.appController.showChecklist(); return false;">✓ Checklist</a>
            <a href="#" class="nav-item" onclick="window.appController.showValidation(); return false;">📊 Validation</a>
            <a href="#" class="nav-item" onclick="window.appController.showExport(); return false;">📤 Export</a>
            <a href="#" class="nav-item" onclick="window.appController.goToLanding(); return false;">🏠 Home</a>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="checklist-container">
          <div class="checklist-sidebar" id="checklistSidebar">
            <!-- Sidebar content rendered by controller -->
          </div>
          
          <div class="checklist-main" id="checklistMain">
            <!-- Main checklist rendered by controller -->
          </div>
          
          <div class="checklist-details" id="checklistDetails">
            <!-- Details panel rendered by controller -->
          </div>
        </div>
      </div>
    `;
  }
}
