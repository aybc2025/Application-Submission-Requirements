/* ============================================
   CHECKLISTCONTROLLER.JS - Checklist Logic Controller
   CD-1 Rezoning Application Checker
   ============================================ */

import { RequirementsEngine } from '../utils/validation.js';
import { RequirementCard } from '../components/RequirementCard.js';
import { Modal } from '../components/Modal.js';
import { STATUS, CATEGORIES } from '../config/constants.js';

export class ChecklistController {
  constructor(project, requirements) {
    this.project = project;
    this.requirements = requirements;
    this.engine = new RequirementsEngine(requirements, project.profile);
    this.applicableReqs = [];
    this.notApplicableReqs = [];
    this.selectedRequirement = null;
    this.currentFilter = 'all';
    this.currentCategory = 'all';
    this.searchQuery = '';
    
    this.initialize();
  }

  initialize() {
    const result = this.engine.getApplicableRequirements();
    this.applicableReqs = result.applicable;
    this.notApplicableReqs = result.notApplicable;
    
    this.render();
  }

  render() {
    this.renderSidebar();
    this.renderMainPanel();
    this.renderDetailsPanel();
  }

  renderSidebar() {
    const sidebar = document.getElementById('checklistSidebar');
    if (!sidebar) return;

    const completionPct = this.project.getCompletionPercentage(this.applicableReqs);
    const stats = this.calculateStats();

    sidebar.innerHTML = `
      <div class="progress-section">
        <h3>Progress</h3>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${completionPct}%">
              ${completionPct}%
            </div>
          </div>
        </div>
        <div style="margin-top: 10px; font-size: 14px; color: #666;">
          ${stats.complete} of ${stats.total} complete
        </div>
      </div>

      <div class="divider"></div>

      <div class="categories-section">
        <h3 class="section-title">Categories</h3>
        ${this.renderCategoryList()}
      </div>

      <div class="divider"></div>

      <div class="filters-section">
        <h3 class="section-title">Status</h3>
        ${this.renderStatusFilters()}
      </div>

      <div class="divider"></div>

      <button class="btn btn-primary" style="width: 100%;" onclick="window.checklistController.saveProject()">
        💾 Save Draft
      </button>
    `;
  }

  renderCategoryList() {
    const categories = this.groupByCategory(this.applicableReqs);
    
    let html = `
      <div class="category-item ${this.currentCategory === 'all' ? 'active' : ''}" 
           onclick="window.checklistController.filterByCategory('all')">
        <span>All Categories</span>
        <span class="category-count">${this.applicableReqs.length}</span>
      </div>
    `;

    for (let category in categories) {
      const items = categories[category];
      const complete = items.filter(item => 
        this.project.requirements[item.id]?.status === STATUS.COMPLETE
      ).length;
      
      const icon = complete === items.length ? '✓' : 
                   complete > 0 ? '⚠' : '✗';

      html += `
        <div class="category-item ${this.currentCategory === category ? 'active' : ''}" 
             onclick="window.checklistController.filterByCategory('${category}')">
          <span>${icon} ${category}</span>
          <span class="category-count">${complete}/${items.length}</span>
        </div>
      `;
    }

    return html;
  }

  renderStatusFilters() {
    const stats = this.calculateStats();

    return `
      <div class="filter-checkbox">
        <input type="checkbox" id="filterAll" ${this.currentFilter === 'all' ? 'checked' : ''} 
               onchange="window.checklistController.filterByStatus('all')">
        <label for="filterAll">Show all (${stats.total})</label>
      </div>
      <div class="filter-checkbox">
        <input type="checkbox" id="filterMissing" ${this.currentFilter === 'missing' ? 'checked' : ''} 
               onchange="window.checklistController.filterByStatus('missing')">
        <label for="filterMissing">Missing only (${stats.missing})</label>
      </div>
      <div class="filter-checkbox">
        <input type="checkbox" id="filterInProgress" ${this.currentFilter === 'in-progress' ? 'checked' : ''} 
               onchange="window.checklistController.filterByStatus('in-progress')">
        <label for="filterInProgress">In progress (${stats.inProgress})</label>
      </div>
      <div class="filter-checkbox">
        <input type="checkbox" id="filterComplete" ${this.currentFilter === 'complete' ? 'checked' : ''} 
               onchange="window.checklistController.filterByStatus('complete')">
        <label for="filterComplete">Complete (${stats.complete})</label>
      </div>
    `;
  }

  renderMainPanel() {
    const main = document.getElementById('checklistMain');
    if (!main) return;

    main.innerHTML = `
      <div class="checklist-header">
        <h2>Requirements Checklist</h2>
      </div>

      <div class="search-box">
        <span>🔍</span>
        <input type="text" placeholder="Search requirements..." 
               value="${this.searchQuery}"
               oninput="window.checklistController.handleSearch(this.value)">
      </div>

      <div class="requirements-list" id="requirementsList">
        ${this.renderRequirementsList()}
      </div>
    `;
  }

  renderRequirementsList() {
    let filtered = this.getFilteredRequirements();

    if (filtered.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No requirements found</div>
          <div class="empty-state-description">Try adjusting your filters</div>
        </div>
      `;
    }

    // Group by criteria
    const required = filtered.filter(req => req.criteria === 'REQUIRED');
    const conditional = filtered.filter(req => req.criteria === 'CONDITIONAL');
    const optional = filtered.filter(req => req.criteria === 'OPTIONAL');

    let html = '';

    if (required.length > 0) {
      html += `
        <div class="requirement-group">
          <div class="group-header">
            <span class="group-icon">🔴</span>
            <span>REQUIRED (${required.length} items)</span>
          </div>
          ${required.map(req => this.renderRequirementCard(req)).join('')}
        </div>
      `;
    }

    if (conditional.length > 0) {
      html += `
        <div class="requirement-group">
          <div class="group-header">
            <span class="group-icon">🟡</span>
            <span>REQUIRED IF (${conditional.length} items)</span>
          </div>
          ${conditional.map(req => this.renderRequirementCard(req)).join('')}
        </div>
      `;
    }

    if (optional.length > 0) {
      html += `
        <div class="requirement-group">
          <div class="group-header">
            <span class="group-icon">🟢</span>
            <span>MAY BE REQUESTED LATER (${optional.length} items)</span>
          </div>
          ${optional.map(req => this.renderRequirementCard(req)).join('')}
        </div>
      `;
    }

    return html;
  }

  renderRequirementCard(req) {
    const status = this.project.requirements[req.id]?.status || STATUS.MISSING;
    const statusIcons = {
      [STATUS.COMPLETE]: '✓',
      [STATUS.IN_PROGRESS]: '⚠️',
      [STATUS.MISSING]: '✗',
      [STATUS.NOT_APPLICABLE]: '⭘'
    };

    const isSelected = this.selectedRequirement?.id === req.id;

    return `
      <div class="requirement-card ${isSelected ? 'selected' : ''}" 
           data-req-id="${req.id}"
           onclick="window.checklistController.selectRequirement('${req.id}')">
        <div class="requirement-card-header">
          <span class="requirement-id">${req.id}</span>
          <span class="requirement-name">${req.name}</span>
          <span class="requirement-status-icon">${statusIcons[status]}</span>
        </div>
        
        <div class="requirement-description">
          ${req.description}
        </div>
        
        ${req.reason && req.criteria === 'CONDITIONAL' ? `
          <div style="margin-top: 8px; padding: 8px; background: #fff3e0; border-radius: 4px; font-size: 13px;">
            ℹ️ Required because: ${req.reason}
          </div>
        ` : ''}
        
        <div class="requirement-meta">
          ${req.estimatedTime ? `<span class="meta-tag time">⏱️ ${req.estimatedTime}</span>` : ''}
          ${req.estimatedCost ? `<span class="meta-tag cost">💰 ${req.estimatedCost}</span>` : ''}
        </div>
      </div>
    `;
  }

  renderDetailsPanel() {
    const details = document.getElementById('checklistDetails');
    if (!details) return;

    if (!this.selectedRequirement) {
      details.innerHTML = `
        <div class="details-empty">
          <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
            Select a requirement
          </div>
          <div>Click on any requirement to view details and update status</div>
        </div>
      `;
      return;
    }

    const req = this.selectedRequirement;
    const status = this.project.requirements[req.id] || {
      status: STATUS.MISSING,
      notes: '',
      uploadedFile: null,
      uploadDate: null
    };

    const dependencies = this.engine.checkDependencies(req.id, this.project);

    details.innerHTML = `
      <div class="details-content">
        <div class="details-header">
          <h3>${req.id} - ${req.name}</h3>
          <div style="margin-top: 8px;">
            <span class="condition-badge condition-${req.criteria.toLowerCase()}">${req.criteria}</span>
          </div>
        </div>

        <div class="details-section">
          <div class="section-label">DESCRIPTION</div>
          <p>${req.description}</p>
        </div>

        ${req.reason && req.criteria === 'CONDITIONAL' ? `
          <div class="details-section">
            <div class="section-label">WHY REQUIRED FOR THIS PROJECT</div>
            <div class="alert alert-info">
              <div class="alert-icon">ℹ️</div>
              <div class="alert-content">${req.reason}</div>
            </div>
          </div>
        ` : ''}

        ${dependencies.missing.length > 0 ? `
          <div class="details-section">
            <div class="section-label">DEPENDENCIES</div>
            <div class="alert alert-warning">
              <div class="alert-icon">⚠️</div>
              <div class="alert-content">
                <div class="alert-title">These items are required first:</div>
                <ul style="margin: 8px 0 0 20px;">
                  ${dependencies.missing.map(dep => `
                    <li>${dep.id} - ${dep.name}</li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        ` : ''}

        ${req.resources && req.resources.length > 0 ? `
          <div class="details-section">
            <div class="section-label">RESOURCES & LINKS</div>
            <ul style="margin: 0; padding-left: 20px;">
              ${req.resources.map(resource => `
                <li><a href="${resource.url}" target="_blank">${resource.name}</a></li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${req.estimatedTime || req.estimatedCost || req.preparedBy ? `
          <div class="details-section">
            <div class="section-label">PLANNING INFORMATION</div>
            ${req.estimatedCost ? `<div>💰 Estimated Cost: ${req.estimatedCost}</div>` : ''}
            ${req.estimatedTime ? `<div>⏱️ Estimated Time: ${req.estimatedTime}</div>` : ''}
            ${req.preparedBy ? `<div>👤 Prepared by: ${req.preparedBy}</div>` : ''}
          </div>
        ` : ''}

        <div class="details-section">
          <div class="section-label">CURRENT STATUS</div>
          <select id="statusSelect" class="form-control" onchange="window.checklistController.updateStatus('${req.id}', this.value)">
            <option value="${STATUS.MISSING}" ${status.status === STATUS.MISSING ? 'selected' : ''}>❌ Not Started</option>
            <option value="${STATUS.IN_PROGRESS}" ${status.status === STATUS.IN_PROGRESS ? 'selected' : ''}>⚠️ In Progress</option>
            <option value="${STATUS.COMPLETE}" ${status.status === STATUS.COMPLETE ? 'selected' : ''}>✅ Complete</option>
            <option value="${STATUS.NOT_APPLICABLE}" ${status.status === STATUS.NOT_APPLICABLE ? 'selected' : ''}>⭘ Not Applicable</option>
          </select>
        </div>

        ${status.uploadedFile ? `
          <div class="details-section">
            <div class="section-label">UPLOADED FILE</div>
            <div class="uploaded-file">
              <div class="file-info">
                <span class="file-icon">📄</span>
                <div>
                  <div class="file-name">${status.uploadedFile}</div>
                  <div class="file-size">Uploaded: ${new Date(status.uploadDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="details-section">
          <div class="section-label">NOTES</div>
          <textarea id="notesTextarea" rows="4" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                    onchange="window.checklistController.updateNotes('${req.id}', this.value)">${status.notes || ''}</textarea>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button class="btn btn-primary" onclick="window.checklistController.markComplete('${req.id}')">
            ✓ Mark Complete
          </button>
          <button class="btn btn-secondary" onclick="window.checklistController.openFileUpload('${req.id}')">
            📁 Upload File
          </button>
        </div>
      </div>
    `;
  }

  selectRequirement(reqId) {
    this.selectedRequirement = this.applicableReqs.find(req => req.id === reqId);
    this.renderDetailsPanel();
    
    // Update visual selection
    document.querySelectorAll('.requirement-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-req-id="${reqId}"]`)?.classList.add('selected');
  }

  updateStatus(reqId, newStatus) {
    this.project.updateRequirement(reqId, { status: newStatus });
    this.render();
  }

  updateNotes(reqId, notes) {
    this.project.updateRequirement(reqId, { notes });
  }

  markComplete(reqId) {
    this.project.updateRequirement(reqId, { 
      status: STATUS.COMPLETE,
      uploadDate: new Date().toISOString()
    });
    this.render();
  }

  openFileUpload(reqId) {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="form-group">
        <label>Upload Document</label>
        <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png">
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #f8f9fa; border-radius: 4px; font-size: 14px;">
        📝 Note: In this demo version, files are simulated. In production, files would be uploaded to a server.
      </div>
    `;

    const modal = new Modal({
      title: 'Upload File',
      content: content,
      footer: `
        <button class="btn btn-secondary" data-action="close">Cancel</button>
        <button class="btn btn-primary" onclick="window.checklistController.handleFileUpload('${reqId}')">Upload</button>
      `,
      onClose: () => {}
    });

    modal.open();
    window.currentModal = modal;
  }

  handleFileUpload(reqId) {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files[0];

    if (file) {
      this.project.updateRequirement(reqId, {
        status: STATUS.COMPLETE,
        uploadedFile: file.name,
        uploadDate: new Date().toISOString()
      });

      if (window.currentModal) {
        window.currentModal.close();
      }

      this.render();
    } else {
      alert('Please select a file');
    }
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.render();
  }

  filterByStatus(status) {
    // Toggle filters
    if (this.currentFilter === status) {
      this.currentFilter = 'all';
    } else {
      this.currentFilter = status;
    }
    this.render();
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.renderMainPanel();
  }

  getFilteredRequirements() {
    let filtered = [...this.applicableReqs];

    // Filter by category
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(req => req.category === this.currentCategory);
    }

    // Filter by status
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(req => {
        const status = this.project.requirements[req.id]?.status || STATUS.MISSING;
        return status === this.currentFilter;
      });
    }

    // Filter by search
    if (this.searchQuery) {
      filtered = filtered.filter(req => {
        return req.name.toLowerCase().includes(this.searchQuery) ||
               req.description.toLowerCase().includes(this.searchQuery) ||
               req.id.toLowerCase().includes(this.searchQuery);
      });
    }

    return filtered;
  }

  groupByCategory(requirements) {
    const groups = {};
    
    requirements.forEach(req => {
      if (!groups[req.category]) {
        groups[req.category] = [];
      }
      groups[req.category].push(req);
    });

    return groups;
  }

  calculateStats() {
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

    return { total, complete, inProgress, missing };
  }

  saveProject() {
    this.project.save();
    alert('✓ Project saved successfully!');
  }
}
