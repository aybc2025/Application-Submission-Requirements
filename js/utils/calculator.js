/* ============================================
   CALCULATOR.JS - Fee Calculations & Utilities
   CD-1 Rezoning Application Checker
   ============================================ */

export class Calculator {
  // Calculate rezoning application fee based on site area and location
  static calculateRezoningFee(siteArea, location) {
    // Simplified fee structure - actual rates would come from Schedule 2 of the Zoning and Development Fee By-Law
    const baseRates = {
      'Downtown': 12.50, // per sqm
      'Broadway Plan Area': 10.00,
      'Transit-Oriented Area': 10.00,
      'Other': 8.50
    };

    const rate = baseRates[location] || baseRates['Other'];
    const calculatedFee = siteArea * rate;

    // Minimum fee
    const minimumFee = 5000;

    return Math.max(calculatedFee, minimumFee);
  }

  // Calculate FSR (Floor Space Ratio)
  static calculateFSR(floorArea, siteArea) {
    if (!floorArea || !siteArea || siteArea === 0) {
      return 0;
    }
    return (floorArea / siteArea).toFixed(2);
  }

  // Format currency
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format number with commas
  static formatNumber(number) {
    return new Intl.NumberFormat('en-CA').format(number);
  }

  // Calculate estimated timeline
  static calculateTimeline(requirements, projectState) {
    const timeEstimates = {
      'weeks': 0,
      'items': []
    };

    requirements.forEach(req => {
      const status = projectState.requirements[req.id]?.status;
      if (status !== 'complete' && req.estimatedTime) {
        const time = this.parseTimeEstimate(req.estimatedTime);
        if (time) {
          timeEstimates.weeks += time;
          timeEstimates.items.push({
            id: req.id,
            name: req.name,
            time: time
          });
        }
      }
    });

    return timeEstimates;
  }

  // Parse time estimate string to weeks
  static parseTimeEstimate(timeString) {
    if (!timeString) return 0;

    timeString = timeString.toLowerCase();

    // Match patterns like "2-4 weeks", "1 week", "3 days", etc.
    const weekMatch = timeString.match(/(\d+)(?:-(\d+))?\s*weeks?/);
    if (weekMatch) {
      const min = parseInt(weekMatch[1]);
      const max = weekMatch[2] ? parseInt(weekMatch[2]) : min;
      return (min + max) / 2; // Return average
    }

    const dayMatch = timeString.match(/(\d+)(?:-(\d+))?\s*days?/);
    if (dayMatch) {
      const min = parseInt(dayMatch[1]);
      const max = dayMatch[2] ? parseInt(dayMatch[2]) : min;
      return ((min + max) / 2) / 7; // Convert to weeks
    }

    const monthMatch = timeString.match(/(\d+)(?:-(\d+))?\s*months?/);
    if (monthMatch) {
      const min = parseInt(monthMatch[1]);
      const max = monthMatch[2] ? parseInt(monthMatch[2]) : min;
      return ((min + max) / 2) * 4; // Convert to weeks
    }

    return 0;
  }

  // Calculate estimated costs
  static calculateTotalEstimatedCost(requirements, projectState) {
    let totalMin = 0;
    let totalMax = 0;
    const items = [];

    requirements.forEach(req => {
      const status = projectState.requirements[req.id]?.status;
      if (status !== 'complete' && req.estimatedCost) {
        const cost = this.parseCostEstimate(req.estimatedCost);
        if (cost) {
          totalMin += cost.min;
          totalMax += cost.max;
          items.push({
            id: req.id,
            name: req.name,
            cost: cost
          });
        }
      }
    });

    return {
      min: totalMin,
      max: totalMax,
      items: items
    };
  }

  // Parse cost estimate string
  static parseCostEstimate(costString) {
    if (!costString) return null;

    costString = costString.replace(/[$,]/g, '');

    // Match patterns like "$3,000-$8,000" or "$5000"
    const rangeMatch = costString.match(/(\d+)(?:-(\d+))?/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = rangeMatch[2] ? parseInt(rangeMatch[2]) : min;
      return { min, max };
    }

    return null;
  }

  // Calculate completion statistics
  static calculateStatistics(requirements, projectState) {
    const stats = {
      total: requirements.length,
      complete: 0,
      inProgress: 0,
      missing: 0,
      notApplicable: 0,
      byCategory: {}
    };

    requirements.forEach(req => {
      const status = projectState.requirements[req.id]?.status || 'missing';

      switch (status) {
        case 'complete':
          stats.complete++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'missing':
          stats.missing++;
          break;
        case 'not-applicable':
          stats.notApplicable++;
          break;
      }

      // By category
      if (!stats.byCategory[req.category]) {
        stats.byCategory[req.category] = {
          total: 0,
          complete: 0,
          inProgress: 0,
          missing: 0
        };
      }

      stats.byCategory[req.category].total++;
      if (status === 'complete') {
        stats.byCategory[req.category].complete++;
      } else if (status === 'in-progress') {
        stats.byCategory[req.category].inProgress++;
      } else if (status === 'missing') {
        stats.byCategory[req.category].missing++;
      }
    });

    return stats;
  }

  // Format date
  static formatDate(dateString, format = 'short') {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (format === 'short') {
      return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }

    if (format === 'long') {
      return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }

    if (format === 'relative') {
      return this.getRelativeTime(date);
    }

    return date.toISOString();
  }

  // Get relative time (e.g., "2 days ago")
  static getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;

    return this.formatDate(date, 'short');
  }
}
