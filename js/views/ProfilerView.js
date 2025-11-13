/* ============================================
   PROFILERVIEW.JS - Profiler View
   CD-1 Rezoning Application Checker
   ============================================ */

export class ProfilerView {
  render() {
    const container = document.getElementById('app');
    
    container.innerHTML = `
      <div class="app-header">
        <div class="header-content">
          <div>
            <h1 class="header-title">Project Profiler</h1>
            <div class="header-subtitle">Step-by-step project setup</div>
          </div>
          <div class="header-nav">
            <a href="#" class="nav-item" onclick="window.appController.goToLanding(); return false;">← Back to Home</a>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="profiler-container">
          <div id="profilerProgress"></div>
          <div id="profilerForm"></div>
        </div>
      </div>
    `;
  }
}
