/* ============================================
   PROJECT.JS - Project Data Model
   CD-1 Rezoning Application Checker
   ============================================ */

import { STATUS, STORAGE_KEYS, MAX_RECENT_PROJECTS, THRESHOLDS } from '../config/constants.js';

export class Project {
  constructor(data = null) {
    if (data) {
      this.load(data);
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.metadata = {
      projectId: this.generateId(),
      projectName: '',
      address: '',
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      reviewer: ''
    };

    this.profile = {
      siteArea: null,
      proposedFloorArea: null,
      location: '',
      nearParkSchool: false,
      inGroundwaterArea: false,
      hasMultipleOwners: false,
      ownerType: 'individual', // individual, company, society
      existingUses: {
        hasResidentialTenants: false,
        hasCommercial: false,
        hasSchedule2Activities: false,
        hasHeritage: false,
        hasCommunityCare: false,
        hasAssistedLiving: false
      },
      proposedUses: {
        hasResidential: false,
        hasCommercial: false,
        hasIndustrial: false,
        hasInstitutional: false,
        buildingHeight: null,
        floorArea: null,
        hasMassTimber: false,
        hasGeoexchange: false
      },
      seekingDCLWaiver: false,
      heldPreApplicationOpenHouse: false,
      seekingSignificantHeight: false,
      exemptFromCAC: false,
      cacNegotiated: false,
      hasBylawSizedTrees: false,
      hasReplacementTrees: false,
      hasOffsiteTrees: false,
      hasInstitutionalUse: false
    };

    this.computedFlags = {};
    this.requirements = {};
    this.validationResults = {
      completionPercentage: 0,
      criticalMissing: [],
      warnings: [],
      suggestions: []
    };
  }

  generateId() {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateProfile(updates) {
    this.profile = { ...this.profile, ...updates };
    this.computeFlags();
    this.updateTimestamp();
    this.save();
  }

  computeFlags() {
    const p = this.profile;

    // Large Site
    this.computedFlags.isLargeSite =
      (p.siteArea && p.siteArea >= THRESHOLDS.LARGE_SITE_AREA) ||
      (p.proposedFloorArea && p.proposedFloorArea >= THRESHOLDS.LARGE_SITE_FLOOR_AREA);

    // TDM Required
    this.computedFlags.requiresTDM =
      ['Downtown', 'Broadway Plan Area', 'Transit-Oriented Area'].includes(p.location) ||
      this.computedFlags.isLargeSite;

    // 3D Model Required
    this.computedFlags.requires3DModel = p.nearParkSchool;

    // Shadow Studies Required
    this.computedFlags.requiresShadowStudies =
      p.proposedUses.buildingHeight && p.proposedUses.buildingHeight > THRESHOLDS.HIGHER_BUILDING_HEIGHT;

    // Public Art Required
    this.computedFlags.requiresPublicArt =
      p.proposedFloorArea && p.proposedFloorArea >= THRESHOLDS.PUBLIC_ART_FLOOR_AREA;

    // TAMS Required
    this.computedFlags.requiresTAMS = this.computedFlags.isLargeSite || p.hasInstitutionalUse;

    // CBA Required/Optional
    this.computedFlags.requiresCBA =
      p.proposedFloorArea && p.proposedFloorArea >= THRESHOLDS.CBA_FLOOR_AREA;
    this.computedFlags.cbaOptional =
      p.proposedFloorArea && p.proposedFloorArea >= THRESHOLDS.PUBLIC_ART_FLOOR_AREA;
  }

  updateRequirement(reqId, updates) {
    if (!this.requirements[reqId]) {
      this.requirements[reqId] = {
        status: STATUS.MISSING,
        uploadedFile: null,
        uploadDate: null,
        notes: '',
        reviewedBy: ''
      };
    }

    this.requirements[reqId] = {
      ...this.requirements[reqId],
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.updateTimestamp();
    this.save();
  }

  getRequirementStatus(reqId) {
    return this.requirements[reqId]?.status || STATUS.MISSING;
  }

  getCompletionPercentage(applicableRequirements) {
    if (!applicableRequirements || applicableRequirements.length === 0) {
      return 0;
    }

    const completed = applicableRequirements.filter(req => {
      const status = this.requirements[req.id]?.status;
      return status === STATUS.COMPLETE;
    }).length;

    return Math.round((completed / applicableRequirements.length) * 100);
  }

  getCriticalMissing(applicableRequirements) {
    return applicableRequirements.filter(req => {
      const status = this.requirements[req.id]?.status;
      return req.criteria === 'REQUIRED' && (status === STATUS.MISSING || !status);
    });
  }

  getInProgressCount(applicableRequirements) {
    return applicableRequirements.filter(req => {
      return this.requirements[req.id]?.status === STATUS.IN_PROGRESS;
    }).length;
  }

  updateTimestamp() {
    this.metadata.lastModified = new Date().toISOString();
  }

  save() {
    const key = `${STORAGE_KEYS.CURRENT_PROJECT}_${this.metadata.projectId}`;
    localStorage.setItem(key, JSON.stringify(this.toJSON()));
    this.saveToRecentList();
  }

  saveToRecentList() {
    let recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROJECTS) || '[]');

    const summary = {
      projectId: this.metadata.projectId,
      projectName: this.metadata.projectName || 'Untitled Project',
      address: this.metadata.address || 'No address',
      lastModified: this.metadata.lastModified,
      completionPercentage: this.validationResults.completionPercentage || 0
    };

    const index = recent.findIndex(p => p.projectId === this.metadata.projectId);
    if (index >= 0) {
      recent[index] = summary;
    } else {
      recent.unshift(summary);
    }

    if (recent.length > MAX_RECENT_PROJECTS) {
      recent = recent.slice(0, MAX_RECENT_PROJECTS);
    }

    localStorage.setItem(STORAGE_KEYS.RECENT_PROJECTS, JSON.stringify(recent));
  }

  static load(projectId) {
    const key = `${STORAGE_KEYS.CURRENT_PROJECT}_${projectId}`;
    const data = localStorage.getItem(key);

    if (data) {
      return new Project(JSON.parse(data));
    }

    return null;
  }

  static getRecentProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROJECTS) || '[]');
  }

  static deleteProject(projectId) {
    const key = `${STORAGE_KEYS.CURRENT_PROJECT}_${projectId}`;
    localStorage.removeItem(key);

    let recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PROJECTS) || '[]');
    recent = recent.filter(p => p.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.RECENT_PROJECTS, JSON.stringify(recent));
  }

  toJSON() {
    return {
      metadata: this.metadata,
      profile: this.profile,
      computedFlags: this.computedFlags,
      requirements: this.requirements,
      validationResults: this.validationResults
    };
  }

  load(data) {
    this.metadata = data.metadata;
    this.profile = data.profile;
    this.computedFlags = data.computedFlags;
    this.requirements = data.requirements;
    this.validationResults = data.validationResults;
  }

  exportJSON() {
    const dataStr = JSON.stringify(this.toJSON(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${this.metadata.address || 'project'}_${Date.now()}.json`;
    link.click();
  }

  static async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          // Generate new ID for imported project
          data.metadata.projectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          data.metadata.lastModified = new Date().toISOString();
          resolve(new Project(data));
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };

      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsText(file);
    });
  }
}
