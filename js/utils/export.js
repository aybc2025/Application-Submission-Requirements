/* ============================================
   EXPORT.JS - PDF/JSON Export Module
   CD-1 Rezoning Application Checker
   ============================================ */

import { Calculator } from './calculator.js';
import { STATUS_ICONS, CRITERIA_ICONS } from '../config/constants.js';

export class ExportManager {
  // Generate PDF Summary Report
  static async generatePDFReport(project, requirements, applicableReqs) {
    // Note: This would require jsPDF library
    // For now, we'll create a printable HTML version
    const html = this.generateReportHTML(project, requirements, applicableReqs);
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // Generate HTML for report
  static generateReportHTML(project, requirements, applicableReqs) {
    const stats = Calculator.calculateStatistics(applicableReqs, project);
    const completionPct = project.getCompletionPercentage(applicableReqs);

    return `
<!DOCTYPE html>
<html>
<head>
  <title>CD-1 Rezoning Application Report - ${project.metadata.address}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0051A5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #0051A5;
      margin: 10px 0;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      background: #0051A5;
      color: white;
      padding: 10px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-item {
      padding: 10px;
      background: #f8f9fa;
      border-left: 3px solid #0051A5;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
    }
    .info-value {
      font-size: 16px;
      margin-top: 5px;
    }
    .progress-bar {
      height: 30px;
      background: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0051A5, #00A3E0);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: bold;
    }
    .status-complete { color: #28A745; }
    .status-in-progress { color: #FFC107; }
    .status-missing { color: #DC3545; }
    .status-not-applicable { color: #6C757D; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CD-1 Rezoning Application Report</h1>
    <p>City of Vancouver</p>
    <p style="font-size: 14px; color: #666;">Generated: ${Calculator.formatDate(new Date(), 'long')}</p>
  </div>

  <div class="section">
    <div class="section-title">Project Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Project Address</div>
        <div class="info-value">${project.metadata.address || 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Project ID</div>
        <div class="info-value">${project.metadata.projectId}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Reviewer</div>
        <div class="info-value">${project.metadata.reviewer || 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Last Modified</div>
        <div class="info-value">${Calculator.formatDate(project.metadata.lastModified, 'long')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Site Area</div>
        <div class="info-value">${project.profile.siteArea ? Calculator.formatNumber(project.profile.siteArea) + ' sqm' : 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Proposed Floor Area</div>
        <div class="info-value">${project.profile.proposedFloorArea ? Calculator.formatNumber(project.profile.proposedFloorArea) + ' sqm' : 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Location</div>
        <div class="info-value">${project.profile.location || 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">FSR</div>
        <div class="info-value">${Calculator.calculateFSR(project.profile.proposedFloorArea, project.profile.siteArea)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Completion Status</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${completionPct}%">${completionPct}% Complete</div>
    </div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Total Requirements</div>
        <div class="info-value">${stats.total}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Complete</div>
        <div class="info-value status-complete">${stats.complete}</div>
      </div>
      <div class="info-item">
        <div class="info-label">In Progress</div>
        <div class="info-value status-in-progress">${stats.inProgress}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Missing</div>
        <div class="info-value status-missing">${stats.missing}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Requirements Checklist</div>
    ${this.generateRequirementsTable(applicableReqs, project)}
  </div>

  ${stats.missing > 0 ? `
  <div class="section">
    <div class="section-title">Missing Items</div>
    ${this.generateMissingItemsTable(applicableReqs, project)}
  </div>
  ` : ''}

  <div class="footer">
    <p>This report was generated by the CD-1 Rezoning Application Checker</p>
    <p>City of Vancouver | rezoning@vancouver.ca</p>
  </div>
</body>
</html>
    `;
  }

  static generateRequirementsTable(requirements, project) {
    let html = '<table><thead><tr><th>ID</th><th>Requirement</th><th>Category</th><th>Status</th><th>Notes</th></tr></thead><tbody>';

    requirements.forEach(req => {
      const status = project.requirements[req.id]?.status || 'missing';
      const notes = project.requirements[req.id]?.notes || '';
      const statusClass = `status-${status}`;

      html += `
        <tr>
          <td>${req.id}</td>
          <td>${req.name}</td>
          <td>${req.category}</td>
          <td class="${statusClass}">${STATUS_ICONS[status]} ${status.replace('-', ' ').toUpperCase()}</td>
          <td>${notes}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  static generateMissingItemsTable(requirements, project) {
    const missing = requirements.filter(req => {
      const status = project.requirements[req.id]?.status || 'missing';
      return status === 'missing';
    });

    let html = '<table><thead><tr><th>ID</th><th>Requirement</th><th>Estimated Time</th><th>Estimated Cost</th></tr></thead><tbody>';

    missing.forEach(req => {
      html += `
        <tr>
          <td>${req.id}</td>
          <td>${req.name}</td>
          <td>${req.estimatedTime || 'N/A'}</td>
          <td>${req.estimatedCost || 'N/A'}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }

  // Generate Deficiency Letter
  static generateDeficiencyLetter(project, requirements, applicableReqs) {
    const missing = applicableReqs.filter(req => {
      const status = project.requirements[req.id]?.status || 'missing';
      return status === 'missing' && req.criteria === 'REQUIRED';
    });

    const clarifications = applicableReqs.filter(req => {
      const status = project.requirements[req.id]?.status || 'missing';
      return status === 'in-progress' || (status === 'missing' && req.criteria === 'CONDITIONAL');
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Deficiency Letter - ${project.metadata.address}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .letterhead {
      text-align: center;
      border-bottom: 2px solid #0051A5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .letterhead h1 {
      color: #0051A5;
      margin: 0;
    }
    .date {
      margin: 20px 0;
    }
    .subject {
      font-weight: bold;
      margin: 20px 0;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
      color: #0051A5;
    }
    ul {
      margin: 10px 0;
      padding-left: 30px;
    }
    li {
      margin: 8px 0;
    }
    .footer {
      margin-top: 50px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="letterhead">
    <h1>City of Vancouver</h1>
    <p>Rezoning Centre</p>
  </div>

  <div class="date">
    ${Calculator.formatDate(new Date(), 'long')}
  </div>

  <div>
    <p>Dear Applicant,</p>
  </div>

  <div class="subject">
    Re: CD-1 Rezoning Application - ${project.metadata.address}
  </div>

  <p>
    Thank you for your rezoning application. Our review has identified the following items that require attention before we can proceed with the application review.
  </p>

  ${missing.length > 0 ? `
  <div class="section">
    <div class="section-title">REQUIRED ITEMS (Must be submitted):</div>
    <ul>
      ${missing.map(req => `
        <li><strong>${req.id} - ${req.name}</strong><br>
        ${req.description}
        ${req.estimatedTime ? `<br><em>Estimated time: ${req.estimatedTime}</em>` : ''}
        ${req.estimatedCost ? `<br><em>Estimated cost: ${req.estimatedCost}</em>` : ''}
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${clarifications.length > 0 ? `
  <div class="section">
    <div class="section-title">CLARIFICATIONS NEEDED:</div>
    <ul>
      ${clarifications.map(req => `
        <li><strong>${req.id} - ${req.name}</strong><br>
        ${req.description}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">HELPFUL TIPS:</div>
    <ul>
      <li>Building Grades (Item 3.1) can take 4-6 weeks to process. We recommend requesting them as soon as possible.</li>
      <li>Survey Plans (Item 3.2) are required for several other submissions. Early completion can expedite your application.</li>
      <li>All forms and guidelines are available on our website at vancouver.ca/rezoning</li>
      <li>For questions, please contact your assigned Rezoning Planner or email rezoning@vancouver.ca</li>
    </ul>
  </div>

  <p>
    Please submit the outstanding items at your earliest convenience. If you have any questions or require clarification on any of the requirements, please don't hesitate to contact us.
  </p>

  <div class="footer">
    <p>Sincerely,</p>
    <p><strong>${project.metadata.reviewer || 'Rezoning Centre'}</strong><br>
    City of Vancouver<br>
    rezoning@vancouver.ca</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  // Generate printable checklist
  static generatePrintableChecklist(requirements, project) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Rezoning Checklist - ${project.metadata.address}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0051A5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .checklist-item {
      padding: 15px;
      border: 1px solid #ddd;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .item-header {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;
    }
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #666;
      flex-shrink: 0;
    }
    .item-id {
      font-weight: bold;
      color: #0051A5;
    }
    .item-name {
      font-weight: bold;
      flex: 1;
    }
    .item-description {
      margin-left: 35px;
      color: #666;
      font-size: 14px;
    }
    .category-header {
      background: #0051A5;
      color: white;
      padding: 10px;
      margin-top: 30px;
      margin-bottom: 15px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CD-1 Rezoning Application Checklist</h1>
    <p>${project.metadata.address}</p>
    <p style="font-size: 14px;">Generated: ${Calculator.formatDate(new Date(), 'long')}</p>
  </div>

  ${this.generateChecklistByCategory(requirements, project)}

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
    <p>City of Vancouver | rezoning@vancouver.ca</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  static generateChecklistByCategory(requirements, project) {
    const categories = {};
    
    requirements.forEach(req => {
      if (!categories[req.category]) {
        categories[req.category] = [];
      }
      categories[req.category].push(req);
    });

    let html = '';

    for (let category in categories) {
      html += `<div class="category-header">${category}</div>`;
      
      categories[category].forEach(req => {
        const status = project.requirements[req.id]?.status;
        const checked = status === 'complete' ? '✓' : '';
        
        html += `
          <div class="checklist-item">
            <div class="item-header">
              <div class="checkbox">${checked}</div>
              <span class="item-id">${req.id}</span>
              <span class="item-name">${req.name}</span>
            </div>
            <div class="item-description">${req.description}</div>
          </div>
        `;
      });
    }

    return html;
  }
}
