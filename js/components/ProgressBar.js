/* ============================================
   PROGRESSBAR.JS - Progress Bar Component
   CD-1 Rezoning Application Checker
   ============================================ */

export class ProgressBar {
  constructor(containerId, percentage = 0) {
    this.container = document.getElementById(containerId);
    this.percentage = percentage;
    this.render();
  }

  setPercentage(percentage) {
    this.percentage = Math.min(100, Math.max(0, percentage));
    this.update();
  }

  render() {
    this.container.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${this.percentage}%">
            ${this.percentage}%
          </div>
        </div>
      </div>
    `;
  }

  update() {
    const fill = this.container.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = `${this.percentage}%`;
      fill.textContent = `${this.percentage}%`;
    }
  }
}
