/* ============================================
   VALIDATION.JS - Validation Rules Engine
   CD-1 Rezoning Application Checker
   ============================================ */

import { CRITERIA, WARNING_TYPES, SUGGESTION_TYPES, THRESHOLDS } from '../config/constants.js';

export class RequirementsEngine {
  constructor(requirements, projectProfile) {
    this.requirements = requirements;
    this.profile = projectProfile;
  }

  evaluateRequirement(reqId) {
    const req = this.requirements[reqId];

    if (!req) {
      return { applicable: false, reason: 'Requirement not found' };
    }

    if (req.criteria === CRITERIA.REQUIRED) {
      return { applicable: true, reason: 'Always required' };
    }

    if (req.criteria === CRITERIA.CONDITIONAL) {
      return this.evaluateConditions(req.conditions);
    }

    if (req.criteria === CRITERIA.OPTIONAL) {
      return { applicable: false, reason: 'Optional item' };
    }

    return { applicable: false, reason: 'Unknown criteria' };
  }

  evaluateConditions(conditions) {
    if (!conditions) {
      return { applicable: false, reason: 'No conditions defined' };
    }

    if (conditions.type === 'OR') {
      for (let rule of conditions.rules) {
        if (this.evaluateRule(rule)) {
          return {
            applicable: true,
            reason: this.getRuleDescription(rule)
          };
        }
      }
      return { applicable: false, reason: 'No conditions met' };
    }

    if (conditions.type === 'AND') {
      const reasons = [];
      for (let rule of conditions.rules) {
        if (!this.evaluateRule(rule)) {
          return { applicable: false, reason: 'Not all conditions met' };
        }
        reasons.push(this.getRuleDescription(rule));
      }
      return { applicable: true, reason: reasons.join(' AND ') };
    }

    if (conditions.type === 'NOT') {
      for (let rule of conditions.rules) {
        if (this.evaluateRule(rule)) {
          return { applicable: false, reason: 'Condition excluded' };
        }
      }
      return { applicable: true, reason: 'Exclusion condition met' };
    }

    return { applicable: false, reason: 'Invalid condition type' };
  }

  evaluateRule(rule) {
    const value = this.getNestedValue(this.profile, rule.field);

    switch (rule.operator) {
      case '>=':
        return value >= rule.value;
      case '<=':
        return value <= rule.value;
      case '>':
        return value > rule.value;
      case '<':
        return value < rule.value;
      case '==':
        return value === rule.value;
      case '!=':
        return value !== rule.value;
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'contains':
        return Array.isArray(value) && value.includes(rule.value);
      default:
        return false;
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  getRuleDescription(rule) {
    const field = rule.field.split('.').pop();
    const fieldLabel = this.humanizeFieldName(field);

    switch (rule.operator) {
      case '>=':
        return `${fieldLabel} is ${rule.value} ${rule.unit || ''} or more`;
      case '==':
        if (typeof rule.value === 'boolean') {
          return rule.value ? `Has ${fieldLabel}` : `No ${fieldLabel}`;
        }
        return `${fieldLabel} is ${rule.value}`;
      case 'in':
        return `Located in ${rule.value.join(' or ')}`;
      default:
        return `${fieldLabel} condition met`;
    }
  }

  humanizeFieldName(field) {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  getApplicableRequirements() {
    const applicable = [];
    const notApplicable = [];

    for (let reqId in this.requirements) {
      const evaluation = this.evaluateRequirement(reqId);

      if (evaluation.applicable) {
        applicable.push({
          ...this.requirements[reqId],
          reason: evaluation.reason
        });
      } else {
        notApplicable.push({
          ...this.requirements[reqId],
          reason: evaluation.reason
        });
      }
    }

    return { applicable, notApplicable };
  }

  validateConsistency(projectState) {
    const warnings = [];

    // Check: Profile says tenants, but no form uploaded
    if (this.profile.existingUses?.hasResidentialTenants) {
      const renterForm = projectState.requirements['5.2'];
      if (!renterForm || renterForm.status === 'missing') {
        warnings.push({
          type: WARNING_TYPES.CONSISTENCY,
          severity: 'warning',
          message: 'Profile indicates residential tenants but Renter Screening Form (5.2) not uploaded',
          relatedItems: ['5.2'],
          suggestedActions: [
            { label: 'Upload Renter Form', action: 'upload', itemId: '5.2' },
            { label: 'Update Profile', action: 'editProfile' }
          ]
        });
      }
    }

    // Check: No Schedule 2 but ESA uploaded
    if (!this.profile.existingUses?.hasSchedule2Activities) {
      const esa = projectState.requirements['4.3'];
      if (esa && esa.status === 'complete') {
        warnings.push({
          type: WARNING_TYPES.DISCREPANCY,
          severity: 'warning',
          message: 'Profile indicates no Schedule 2 activities, but Phase 1 ESA report (4.3) uploaded',
          relatedItems: ['4.3'],
          suggestedActions: [
            { label: 'Review Profile', action: 'editProfile' },
            { label: 'Review ESA', action: 'viewItem', itemId: '4.3' }
          ]
        });
      }
    }

    // Check: Commercial use but no sign fee
    if (this.profile.proposedUses?.hasCommercial && !this.profile.existingUses?.hasCommercial) {
      const signFee = projectState.requirements['1.3'];
      if (!signFee || signFee.status === 'missing') {
        warnings.push({
          type: WARNING_TYPES.CONSISTENCY,
          severity: 'warning',
          message: 'New commercial use requires Sign By-law Amendment Application Fee (1.3)',
          relatedItems: ['1.3'],
          suggestedActions: [
            { label: 'Review Sign Fee', action: 'viewItem', itemId: '1.3' }
          ]
        });
      }
    }

    // Check: Community Care but no resident form
    if (this.profile.existingUses?.hasCommunityCare || this.profile.existingUses?.hasAssistedLiving) {
      const residentForm = projectState.requirements['5.3'];
      if (!residentForm || residentForm.status === 'missing') {
        warnings.push({
          type: WARNING_TYPES.CONSISTENCY,
          severity: 'warning',
          message: 'Community care or assisted living facility requires Resident Screening Form (5.3)',
          relatedItems: ['5.3'],
          suggestedActions: [
            { label: 'Upload Resident Form', action: 'upload', itemId: '5.3' }
          ]
        });
      }
    }

    return warnings;
  }

  generateSuggestions(projectState) {
    const suggestions = [];

    // Near Large Site threshold
    if (this.profile.siteArea > 6000 && this.profile.siteArea < THRESHOLDS.LARGE_SITE_AREA) {
      suggestions.push({
        type: SUGGESTION_TYPES.PROACTIVE,
        priority: 'medium',
        message: `Site area (${this.profile.siteArea} sqm) is approaching Large Site threshold (${THRESHOLDS.LARGE_SITE_AREA} sqm). Consider preparing TAMS and Large Site documentation early to avoid delays if proposal changes.`,
        relatedItems: ['4.7', '4.12']
      });
    }

    // Building Grades timing
    const buildingGrades = projectState.requirements['3.1'];
    if (!buildingGrades || buildingGrades.status === 'missing') {
      suggestions.push({
        type: SUGGESTION_TYPES.TIMING,
        priority: 'high',
        message: 'Building Grades (3.1) can take 4-6 weeks to process. Request as soon as possible to avoid delays.',
        relatedItems: ['3.1']
      });
    }

    // Hydrogeological study depends on building grades
    const { applicable } = this.getApplicableRequirements();
    const hydroStudy = applicable.find(req => req.id === '4.5');
    if (hydroStudy && (!buildingGrades || buildingGrades.status !== 'complete')) {
      suggestions.push({
        type: SUGGESTION_TYPES.TIMING,
        priority: 'high',
        message: 'Preliminary Hydrogeological Study (4.5) requires Building Grades (3.1) to be completed first. Consider requesting building grades now.',
        relatedItems: ['3.1', '4.5']
      });
    }

    // Public Art - early contact
    if (this.profile.proposedFloorArea >= THRESHOLDS.PUBLIC_ART_FLOOR_AREA) {
      const publicArt = projectState.requirements['5.7'];
      if (!publicArt || !publicArt.notes?.includes('contacted')) {
        suggestions.push({
          type: SUGGESTION_TYPES.PROACTIVE,
          priority: 'medium',
          message: 'For projects requiring Public Art (5.7), contact public art staff within 90 days of application submission and before hiring consultants.',
          relatedItems: ['5.7']
        });
      }
    }

    // TDM Plan preparation
    if (this.profile.location && ['Downtown', 'Broadway Plan Area', 'Transit-Oriented Area'].includes(this.profile.location)) {
      const tdm = projectState.requirements['4.6'];
      if (!tdm || tdm.status === 'missing') {
        suggestions.push({
          type: SUGGESTION_TYPES.EFFICIENCY,
          priority: 'medium',
          message: 'Transportation Demand Management Plan (4.6) is required at Development Permit stage but recommended at Rezoning. Early preparation can reduce parking requirements.',
          relatedItems: ['4.6']
        });
      }
    }

    // Survey Plan timing
    const survey = projectState.requirements['3.2'];
    if (!survey || survey.status === 'missing') {
      suggestions.push({
        type: SUGGESTION_TYPES.TIMING,
        priority: 'medium',
        message: 'Survey Plan (3.2) typically takes 2-3 weeks. Plan ahead as it\'s required for several other submissions.',
        relatedItems: ['3.2']
      });
    }

    return suggestions;
  }

  checkDependencies(reqId, projectState) {
    const req = this.requirements[reqId];
    if (!req || !req.dependencies || req.dependencies.length === 0) {
      return { satisfied: true, missing: [] };
    }

    const missing = req.dependencies.filter(depId => {
      const dep = projectState.requirements[depId];
      return !dep || dep.status !== 'complete';
    });

    return {
      satisfied: missing.length === 0,
      missing: missing.map(depId => this.requirements[depId])
    };
  }
}
