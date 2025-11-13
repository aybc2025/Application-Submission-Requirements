/* ============================================
   VALIDATIONCONTROLLER.JS - Validation Dashboard Logic
   CD-1 Rezoning Application Checker
   ============================================ */

import { RequirementsEngine } from '../utils/validation.js';
import { Calculator } from '../utils/calculator.js';
import { STATUS } from '../config/constants.js';

export class ValidationController {
  constructor(project, requirements) {
    this.project = project;
    this.requirements = requirements;
    this.engine = new RequirementsEngine(requirements, project.profile);
    
    this.initialize();
  }

  initialize() {
    const result = this.engine.getApplicableRequirements();
    this.applicableReqs = result.applicable;
    
    this.render();
  }

  render() {
    const container = document.getElementById('validationDashboard');
    if (!container) return;

    const stats = this.calculateStatistics();
    const warnings = this.engine.validateConsistency(this.project);
    const suggestions = this.engine.generateSuggestions(this.project);
    const criticalMissing = this.project.getCriticalMissing(this.applicableReqs);

    container.innerHTML = `
      <div class="dashboard-container">
        <h2>Validation Dashboard</h2>
        <p class="text-muted">Review your application completeness and address any issues</p>

        ${this.renderOverviewCards(stats, warnings, suggestions, criticalMissing)}

        ${criticalMissing.length > 0 ? this.renderCriticalIssues(criticalMissing) : ''}

        ${warnings.length > 0 ? this.renderWarnings(warnings) : ''}

        ${suggestions.length > 0 ? this.renderSuggestions(suggestions) : ''}

        ${this.renderTimeline()}

        <div style="margin-top: 40px; display: flex; gap: 16px;">
          <button class="btn btn-primary" onclick="window.exportManager.generatePDFReport()">
            📊 Export PDF Report
          </button>
          <button class="btn btn-secondary" onclick="window.exportManager.generateDeficiencyLetter()">
            📋 Generate Deficiency Letter
          </button>
          <button class="btn btn-secondary" onclick="window.exportManager.generatePrintableChecklist()">
            🖨️ Print Checklist
          </button>
        </div>
      </div>
    `;
  }

  renderOverviewCards(stats, warnings, suggestions, criticalMissing) {
    return `
      <div class="dashboard-cards">
        <div class="dashboard-card">
          <div class="dashboard-card-value" style="color: ${stats.completionPct >= 80 ? 'var(--color-complete)' : 'var(--color-warning)'}">
            ${stats.completionPct}%
          </div>
          <div class="dashboard-card-label">Complete</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-value" style="color: ${stats.missing === 0 ? 'var(--color-complete)' : 'var(--color-error)'}">
            ${stats.missing}
          </div>
          <div class="dashboard-card-label">Missing Items</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-value" style="color: ${criticalMissing.length === 0 ? 'var(--color-complete)' : 'var(--color-error)'}">
            ${criticalMissing.length}
          </div>
          <div class="dashboard-card-label">Critical Issues</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-value" style="color: var(--color-warning)">
            ${warnings.length}
          </div>
          <div class="dashboard-card-label">Warnings</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-value" style="color: var(--color-in-progress)">
            ${stats.inProgress}
          </div>
          <div class="dashboard-card-label">In Progress</div>
        </div>

        <div class="dashboard-card">
          <div class="dashboard-card-value" style="color: var(--color-info)">
            ${suggestions.length}
          </div>
          <div class="dashboard-card-label">Suggestions</div>
        </div>
      </div>
    `;
  }

  renderCriticalIssues(criticalMissing) {
    return `
      <div class="dashboard-section">
        <h3>🔴 Critical Issues (Blocking Submission)</h3>
        <p class="text-muted">These required items must be submitted before the application can proceed</p>

        ${criticalMissing.map(req => `
          <div class="issue-item">
            <div class="issue-icon" style="color: var(--color-error);">✗</div>
            <div class="issue-content">
              <div style="font-weight: 600;">${req.id} - ${req.name}</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">${req.description}</div>
              ${req.estimatedTime ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">⏱️ Estimated time: ${req.estimatedTime}</div>` : ''}
              <div class="issue-actions">
                <button class="btn btn-sm btn-primary" onclick="window.checklistController.selectRequirement('${req.id}'); window.appController.showChecklist();">
                  View Item
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderWarnings(warnings) {
    return `
      <div class="dashboard-section">
        <h3>⚠️ Warnings (Review Recommended)</h3>
        <p class="text-muted">These items may need attention or clarification</p>

        ${warnings.map(warning => `
          <div class="issue-item">
            <div class="issue-icon" style="color: var(--color-warning);">⚠️</div>
            <div class="issue-content">
              <div style="font-weight: 600;">${warning.type.toUpperCase()}</div>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">${warning.message}</div>
              <div class="issue-actions">
                ${warning.suggestedActions.map(action => `
                  <button class="btn btn-sm btn-secondary" onclick="window.validationController.handleAction('${action.action}', '${action.itemId}')">
                    ${action.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderSuggestions(suggestions) {
    return `
      <div class="dashboard-section">
        <h3>💡 Suggestions (Optional Improvements)</h3>
        <p class="text-muted">These tips can help expedite your application</p>

        ${suggestions.map(suggestion => `
          <div class="issue-item">
            <div class="issue-icon" style="color: var(--color-info);">💡</div>
            <div class="issue-content">
              <div style="font-size: 14px;">${suggestion.message}</div>
              ${suggestion.relatedItems && suggestion.relatedItems.length > 0 ? `
                <div style="font-size: 13px; color: #666; margin-top: 4px;">
                  Related items: ${suggestion.relatedItems.join(', ')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderTimeline() {
    const timeline = Calculator.calculateTimeline(this.applicableReqs, this.project);
    
    if (timeline.items.length === 0) {
      return '';
    }

    return `
      <div class="dashboard-section">
        <h3>📅 Timeline & Deadlines</h3>
        <p class="text-muted">Estimated time for pending items</p>

        <div class="alert alert-info">
          <div class="alert-icon">⏱️</div>
          <div class="alert-content">
            <div class="alert-title">Estimated Total Time</div>
            Approximately ${Math.ceil(timeline.weeks)} weeks for all pending items
            <div style="font-size: 13px; margin-top: 8px; color: #666;">
              Note: Some items can be prepared in parallel. This is a cumulative estimate.
            </div>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <h4>Longest Lead Items:</h4>
          <div class="timeline">
            ${timeline.items
              .sort((a, b) => b.time - a.time)
              .slice(0, 5)
              .map(item => `
                <div class="timeline-item">
                  <div class="timeline-content">
                    <div style="font-weight: 600;">${item.id} - ${item.name}</div>
                    <div style="font-size: 14px; color: #666;">Estimated: ${item.time} weeks</div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  calculateStatistics() {
    const total = this.applicableReqs.length;
    let complete = 0;
    let inProgress = 0;
    let missing = 0;

    this.applicableReqs.forEach(req => {
      const status = this.project.requirements[req.id]?.status || STATUS.MISSING;
      if (status === STATUS.COMPLETE) complete++;
      else if (status === STATUS.IN_PROGRESS) inProgress++;
      else if (status === STATUS.MISSING) missing++;
    });

    const completionPct = Math.round((complete / total) * 100);

    return { total, complete, inProgress, missing, completionPct };
  }

  handleAction(action, itemId) {
    if (action === 'upload') {
      window.checklistController.selectRequirement(itemId);
      window.checklistController.openFileUpload(itemId);
      window.appController.showChecklist();
    } else if (action === 'viewItem') {
      window.checklistController.selectRequirement(itemId);
      window.appController.showChecklist();
    } else if (action === 'editProfile') {
      window.appController.showProfiler();
    }
  }
}
