/* ============================================
   PROFILERCONTROLLER.JS - Profiler Logic Controller
   CD-1 Rezoning Application Checker
   ============================================ */

import { PROFILER_STEPS, LOCATIONS, VALIDATION_MESSAGES } from '../config/constants.js';

export class ProfilerController {
  constructor(project) {
    this.project = project;
    this.currentStep = 0;
    this.steps = PROFILER_STEPS;
  }

  initialize() {
    this.renderStep();
  }

  renderStep() {
    const step = this.steps[this.currentStep];
    
    switch(step.id) {
      case 'site-details':
        this.renderSiteDetails();
        break;
      case 'location':
        this.renderLocation();
        break;
      case 'existing-uses':
        this.renderExistingUses();
        break;
      case 'proposed-uses':
        this.renderProposedUses();
        break;
      case 'summary':
        this.renderSummary();
        break;
    }

    this.renderProgress();
  }

  renderProgress() {
    const progressContainer = document.getElementById('profilerProgress');
    if (!progressContainer) return;

    let html = '<div class="profiler-progress">';
    
    this.steps.forEach((step, index) => {
      const classes = ['progress-step'];
      if (index < this.currentStep) classes.push('completed');
      if (index === this.currentStep) classes.push('active');

      html += `
        <div class="${classes.join(' ')}">
          <div class="step-number">${step.number}</div>
          <div class="step-name">${step.name}</div>
        </div>
      `;
    });

    html += '</div>';
    progressContainer.innerHTML = html;
  }

  renderSiteDetails() {
    const container = document.getElementById('profilerForm');
    
    container.innerHTML = `
      <div class="profiler-form">
        <h2>Step 1: Site Details</h2>
        
        <div class="form-section">
          <div class="form-group">
            <label for="projectName">Project Name</label>
            <input type="text" id="projectName" value="${this.project.metadata.projectName || ''}" placeholder="Enter project name">
          </div>

          <div class="form-group">
            <label for="address">Project Address *</label>
            <input type="text" id="address" value="${this.project.metadata.address || ''}" placeholder="123 Main Street, Vancouver" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="siteArea">Site Area (sqm) *</label>
              <input type="number" id="siteArea" value="${this.project.profile.siteArea || ''}" placeholder="2500" required>
              <div class="form-helper">Total area of the development site</div>
            </div>

            <div class="form-group">
              <label for="proposedFloorArea">Proposed Floor Area (sqm) *</label>
              <input type="number" id="proposedFloorArea" value="${this.project.profile.proposedFloorArea || ''}" placeholder="12000" required>
              <div class="form-helper">Total proposed floor area</div>
            </div>
          </div>

          <div class="form-group">
            <label for="reviewer">Reviewer Name</label>
            <input type="text" id="reviewer" value="${this.project.metadata.reviewer || ''}" placeholder="Your name">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="hasMultipleOwners" ${this.project.profile.hasMultipleOwners ? 'checked' : ''}>
              Site has multiple owners
            </label>
          </div>

          <div class="form-group">
            <label for="ownerType">Owner Type</label>
            <select id="ownerType">
              <option value="individual" ${this.project.profile.ownerType === 'individual' ? 'selected' : ''}>Individual</option>
              <option value="company" ${this.project.profile.ownerType === 'company' ? 'selected' : ''}>Company</option>
              <option value="society" ${this.project.profile.ownerType === 'society' ? 'selected' : ''}>Society</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="window.appController.goToLanding()">← Back</button>
          <button class="btn btn-primary" onclick="window.profilerController.nextStep()">Continue →</button>
        </div>
      </div>
    `;
  }

  renderLocation() {
    const container = document.getElementById('profilerForm');
    
    container.innerHTML = `
      <div class="profiler-form">
        <h2>Step 2: Location</h2>
        
        <div class="form-section">
          <div class="form-group">
            <label for="location">Location / Planning Area *</label>
            <select id="location" required>
              <option value="">Select location...</option>
              ${LOCATIONS.map(loc => `
                <option value="${loc}" ${this.project.profile.location === loc ? 'selected' : ''}>${loc}</option>
              `).join('')}
            </select>
            <div class="form-helper">Select the planning area where the site is located</div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="nearParkSchool" ${this.project.profile.nearParkSchool ? 'checked' : ''}>
              Site is within two blocks of, or has direct shadow impact to parks, schools, plazas, or shopping streets
            </label>
            <div class="form-helper">This determines if a 3D model is required</div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" id="inGroundwaterArea" ${this.project.profile.inGroundwaterArea ? 'checked' : ''}>
              Site is in a groundwater area of concern
            </label>
            <div class="form-helper">
              Check the <a href="https://vancouver.ca/groundwater-map" target="_blank">Groundwater Areas Map</a> to verify
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="window.profilerController.prevStep()">← Back</button>
          <button class="btn btn-primary" onclick="window.profilerController.nextStep()">Continue →</button>
        </div>
      </div>
    `;
  }

  renderExistingUses() {
    const container = document.getElementById('profilerForm');
    
    container.innerHTML = `
      <div class="profiler-form">
        <h2>Step 3: Existing Site Uses</h2>
        
        <div class="form-section">
          <div class="form-section-title">Does the site currently have:</div>

          <div class="checkbox-list">
            <div class="checkbox-item">
              <input type="checkbox" id="hasResidentialTenants" ${this.project.profile.existingUses?.hasResidentialTenants ? 'checked' : ''}>
              <label for="hasResidentialTenants">Residential tenants (occupied or unoccupied units)</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasCommercial" ${this.project.profile.existingUses?.hasCommercial ? 'checked' : ''}>
              <label for="hasCommercial">Commercial uses</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasSchedule2Activities" ${this.project.profile.existingUses?.hasSchedule2Activities ? 'checked' : ''}>
              <label for="hasSchedule2Activities">Schedule 2 activities (industrial/contamination risk)</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasHeritage" ${this.project.profile.existingUses?.hasHeritage ? 'checked' : ''}>
              <label for="hasHeritage">Heritage building or potential heritage value</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasCommunityCare" ${this.project.profile.existingUses?.hasCommunityCare ? 'checked' : ''}>
              <label for="hasCommunityCare">Community care facility (long-term care)</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasAssistedLiving" ${this.project.profile.existingUses?.hasAssistedLiving ? 'checked' : ''}>
              <label for="hasAssistedLiving">Assisted living facility</label>
            </div>
          </div>

          <div class="alert alert-info" style="margin-top: 20px;">
            <div class="alert-icon">ℹ️</div>
            <div class="alert-content">
              <div class="alert-title">Important</div>
              Tenants should be notified as soon as you are considering a rezoning application. Contact trp@vancouver.ca for advice on tenant relocation and protection.
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="window.profilerController.prevStep()">← Back</button>
          <button class="btn btn-primary" onclick="window.profilerController.nextStep()">Continue →</button>
        </div>
      </div>
    `;
  }

  renderProposedUses() {
    const container = document.getElementById('profilerForm');
    
    container.innerHTML = `
      <div class="profiler-form">
        <h2>Step 4: Proposed Development</h2>
        
        <div class="form-section">
          <div class="form-section-title">Proposed Uses:</div>

          <div class="checkbox-list">
            <div class="checkbox-item">
              <input type="checkbox" id="hasResidential" ${this.project.profile.proposedUses?.hasResidential ? 'checked' : ''}>
              <label for="hasResidential">Residential</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="proposedHasCommercial" ${this.project.profile.proposedUses?.hasCommercial ? 'checked' : ''}>
              <label for="proposedHasCommercial">Commercial</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasIndustrial" ${this.project.profile.proposedUses?.hasIndustrial ? 'checked' : ''}>
              <label for="hasIndustrial">Industrial</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasInstitutional" ${this.project.profile.proposedUses?.hasInstitutional ? 'checked' : ''}>
              <label for="hasInstitutional">Institutional (schools, hospitals, etc.)</label>
            </div>
          </div>

          <div class="form-section-title" style="margin-top: 30px;">Building Details:</div>

          <div class="form-row">
            <div class="form-group">
              <label for="buildingHeight">Building Height (meters)</label>
              <input type="number" id="buildingHeight" value="${this.project.profile.proposedUses?.buildingHeight || ''}" placeholder="35">
              <div class="form-helper">Maximum height of proposed building</div>
            </div>

            <div class="form-group">
              <label for="proposedFloorAreaConfirm">Confirm Floor Area (sqm)</label>
              <input type="number" id="proposedFloorAreaConfirm" value="${this.project.profile.proposedFloorArea || ''}" placeholder="12000">
            </div>
          </div>

          <div class="form-section-title" style="margin-top: 30px;">Special Features:</div>

          <div class="checkbox-list">
            <div class="checkbox-item">
              <input type="checkbox" id="hasMassTimber" ${this.project.profile.proposedUses?.hasMassTimber ? 'checked' : ''}>
              <label for="hasMassTimber">Mass timber construction</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasGeoexchange" ${this.project.profile.proposedUses?.hasGeoexchange ? 'checked' : ''}>
              <label for="hasGeoexchange">Geoexchange system (open-loop)</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="seekingSignificantHeight" ${this.project.profile.seekingSignificantHeight ? 'checked' : ''}>
              <label for="seekingSignificantHeight">Seeking significant additional height (Higher Buildings Policy)</label>
            </div>
          </div>

          <div class="form-section-title" style="margin-top: 30px;">Other Considerations:</div>

          <div class="checkbox-list">
            <div class="checkbox-item">
              <input type="checkbox" id="seekingDCLWaiver" ${this.project.profile.seekingDCLWaiver ? 'checked' : ''}>
              <label for="seekingDCLWaiver">Seeking Development Cost Levy (DCL) waiver</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="exemptFromCAC" ${this.project.profile.exemptFromCAC ? 'checked' : ''}>
              <label for="exemptFromCAC">Exempt from Community Amenity Contributions (CAC)</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="cacNegotiated" ${this.project.profile.cacNegotiated ? 'checked' : ''}>
              <label for="cacNegotiated">CAC based on negotiated contribution</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="heldPreApplicationOpenHouse" ${this.project.profile.heldPreApplicationOpenHouse ? 'checked' : ''}>
              <label for="heldPreApplicationOpenHouse">Held pre-application open house</label>
            </div>

            <div class="checkbox-item">
              <input type="checkbox" id="hasBylawSizedTrees" ${this.project.profile.hasBylawSizedTrees ? 'checked' : ''}>
              <label for="hasBylawSizedTrees">Site has by-law sized trees (20cm+ diameter)</label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="window.profilerController.prevStep()">← Back</button>
          <button class="btn btn-primary" onclick="window.profilerController.nextStep()">Continue →</button>
        </div>
      </div>
    `;
  }

  renderSummary() {
    // Compute flags before showing summary
    this.saveCurrentStep();
    this.project.computeFlags();

    const container = document.getElementById('profilerForm');
    
    const fsr = this.project.profile.proposedFloorArea && this.project.profile.siteArea
      ? (this.project.profile.proposedFloorArea / this.project.profile.siteArea).toFixed(2)
      : 'N/A';

    container.innerHTML = `
      <div class="profiler-form">
        <h2>Step 5: Profile Summary</h2>
        
        <div class="alert alert-success">
          <div class="alert-icon">✓</div>
          <div class="alert-content">
            <div class="alert-title">Profile Complete</div>
            Review your project profile below. You can edit any section by going back.
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Project Details</div>
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
              <div class="info-label">Site Area</div>
              <div class="info-value">${this.project.profile.siteArea ? this.project.profile.siteArea.toLocaleString() + ' sqm' : 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Proposed Floor Area</div>
              <div class="info-value">${this.project.profile.proposedFloorArea ? this.project.profile.proposedFloorArea.toLocaleString() + ' sqm' : 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">FSR</div>
              <div class="info-value">${fsr}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Location</div>
              <div class="info-value">${this.project.profile.location || 'Not specified'}</div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Computed Flags</div>
          <div class="tags">
            ${this.project.computedFlags.isLargeSite ? '<span class="tag" style="background: #ffebee; color: #c62828;">🏢 Large Site</span>' : ''}
            ${this.project.computedFlags.requiresTDM ? '<span class="tag" style="background: #e3f2fd; color: #1565c0;">🚇 TDM Required</span>' : ''}
            ${this.project.computedFlags.requires3DModel ? '<span class="tag" style="background: #f3e5f5; color: #6a1b9a;">🎨 3D Model Required</span>' : ''}
            ${this.project.computedFlags.requiresShadowStudies ? '<span class="tag" style="background: #fff3e0; color: #e65100;">☀️ Shadow Studies Required</span>' : ''}
            ${this.project.computedFlags.requiresPublicArt ? '<span class="tag" style="background: #e8f5e9; color: #2e7d32;">🎭 Public Art Required</span>' : ''}
            ${this.project.computedFlags.requiresTAMS ? '<span class="tag" style="background: #fce4ec; color: #c2185b;">🚗 TAMS Required</span>' : ''}
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="window.profilerController.prevStep()">← Back</button>
          <button class="btn btn-primary" onclick="window.profilerController.completeProfile()">Continue to Checklist →</button>
        </div>
      </div>
    `;
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveCurrentStep();

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep();
      window.scrollTo(0, 0);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
      window.scrollTo(0, 0);
    }
  }

  validateCurrentStep() {
    const step = this.steps[this.currentStep];
    
    if (step.id === 'site-details') {
      const address = document.getElementById('address')?.value;
      const siteArea = document.getElementById('siteArea')?.value;
      const proposedFloorArea = document.getElementById('proposedFloorArea')?.value;

      if (!address || !siteArea || !proposedFloorArea) {
        alert('Please fill in all required fields (marked with *)');
        return false;
      }

      if (parseFloat(siteArea) <= 0 || parseFloat(proposedFloorArea) <= 0) {
        alert('Site area and floor area must be greater than 0');
        return false;
      }
    }

    if (step.id === 'location') {
      const location = document.getElementById('location')?.value;
      if (!location) {
        alert('Please select a location');
        return false;
      }
    }

    return true;
  }

  saveCurrentStep() {
    const step = this.steps[this.currentStep];

    if (step.id === 'site-details') {
      this.project.metadata.projectName = document.getElementById('projectName')?.value || '';
      this.project.metadata.address = document.getElementById('address')?.value || '';
      this.project.metadata.reviewer = document.getElementById('reviewer')?.value || '';
      this.project.profile.siteArea = parseFloat(document.getElementById('siteArea')?.value) || null;
      this.project.profile.proposedFloorArea = parseFloat(document.getElementById('proposedFloorArea')?.value) || null;
      this.project.profile.hasMultipleOwners = document.getElementById('hasMultipleOwners')?.checked || false;
      this.project.profile.ownerType = document.getElementById('ownerType')?.value || 'individual';
    }

    if (step.id === 'location') {
      this.project.profile.location = document.getElementById('location')?.value || '';
      this.project.profile.nearParkSchool = document.getElementById('nearParkSchool')?.checked || false;
      this.project.profile.inGroundwaterArea = document.getElementById('inGroundwaterArea')?.checked || false;
    }

    if (step.id === 'existing-uses') {
      this.project.profile.existingUses = {
        hasResidentialTenants: document.getElementById('hasResidentialTenants')?.checked || false,
        hasCommercial: document.getElementById('hasCommercial')?.checked || false,
        hasSchedule2Activities: document.getElementById('hasSchedule2Activities')?.checked || false,
        hasHeritage: document.getElementById('hasHeritage')?.checked || false,
        hasCommunityCare: document.getElementById('hasCommunityCare')?.checked || false,
        hasAssistedLiving: document.getElementById('hasAssistedLiving')?.checked || false
      };
    }

    if (step.id === 'proposed-uses') {
      this.project.profile.proposedUses = {
        hasResidential: document.getElementById('hasResidential')?.checked || false,
        hasCommercial: document.getElementById('proposedHasCommercial')?.checked || false,
        hasIndustrial: document.getElementById('hasIndustrial')?.checked || false,
        hasInstitutional: document.getElementById('hasInstitutional')?.checked || false,
        buildingHeight: parseFloat(document.getElementById('buildingHeight')?.value) || null,
        floorArea: parseFloat(document.getElementById('proposedFloorAreaConfirm')?.value) || this.project.profile.proposedFloorArea,
        hasMassTimber: document.getElementById('hasMassTimber')?.checked || false,
        hasGeoexchange: document.getElementById('hasGeoexchange')?.checked || false
      };

      this.project.profile.seekingSignificantHeight = document.getElementById('seekingSignificantHeight')?.checked || false;
      this.project.profile.seekingDCLWaiver = document.getElementById('seekingDCLWaiver')?.checked || false;
      this.project.profile.exemptFromCAC = document.getElementById('exemptFromCAC')?.checked || false;
      this.project.profile.cacNegotiated = document.getElementById('cacNegotiated')?.checked || false;
      this.project.profile.heldPreApplicationOpenHouse = document.getElementById('heldPreApplicationOpenHouse')?.checked || false;
      this.project.profile.hasBylawSizedTrees = document.getElementById('hasBylawSizedTrees')?.checked || false;
      this.project.profile.hasInstitutionalUse = document.getElementById('hasInstitutional')?.checked || false;
    }

    this.project.save();
  }

  completeProfile() {
    this.saveCurrentStep();
    this.project.computeFlags();
    this.project.save();
    
    // Navigate to checklist
    if (window.appController) {
      window.appController.showChecklist();
    }
  }
}
