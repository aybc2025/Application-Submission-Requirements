/* ============================================
   REQUIREMENTCARD.JS - Requirement Card Component
   CD-1 Rezoning Application Checker
   ============================================ */

import { STATUS_ICONS, CRITERIA_ICONS } from '../config/constants.js';

export class RequirementCard {
  constructor(requirement, status, onClick) {
    this.requirement = requirement;
    this.status = status || 'missing';
    this.onClick = onClick;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'requirement-card';
    card.dataset.reqId = this.requirement.id;
    
    card.innerHTML = `
      <div class="requirement-card-header">
        <span class="requirement-id">${this.requirement.id}</span>
        <span class="requirement-name">${this.requirement.name}</span>
        <span class="requirement-status-icon">${STATUS_ICONS[this.status]}</span>
      </div>
      
      <div class="requirement-description">
        ${this.requirement.description}
      </div>
      
      <div class="requirement-meta">
        <span class="meta-tag">${CRITERIA_ICONS[this.requirement.criteria]} ${this.requirement.criteria}</span>
        ${this.requirement.estimatedTime ? `<span class="meta-tag time">⏱️ ${this.requirement.estimatedTime}</span>` : ''}
        ${this.requirement.estimatedCost ? `<span class="meta-tag cost">💰 ${this.requirement.estimatedCost}</span>` : ''}
      </div>
    `;

    if (this.onClick) {
      card.addEventListener('click', () => this.onClick(this.requirement));
    }

    return card;
  }

  update(status) {
    this.status = status;
    // Would update the DOM if card is already rendered
  }
}
