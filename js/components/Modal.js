/* ============================================
   MODAL.JS - Modal Component
   CD-1 Rezoning Application Checker
   ============================================ */

export class Modal {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.onClose = options.onClose || null;
    this.footer = options.footer || null;
    this.size = options.size || 'medium'; // small, medium, large
    this.overlay = null;
    this.modal = null;
  }

  open() {
    this.render();
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    this.modal.focus();
    
    // Close on escape
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEscape);
  }

  close() {
    if (this.onClose) {
      this.onClose();
    }
    
    document.removeEventListener('keydown', this.handleEscape);
    document.body.style.overflow = '';
    
    if (this.overlay) {
      this.overlay.remove();
    }
  }

  render() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Create modal
    this.modal = document.createElement('div');
    this.modal.className = `modal modal-${this.size}`;
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('tabindex', '-1');

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <h2 class="modal-title">${this.title}</h2>
      <button class="modal-close" aria-label="Close">&times;</button>
    `;

    const closeBtn = header.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.close());

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    if (typeof this.content === 'string') {
      body.innerHTML = this.content;
    } else {
      body.appendChild(this.content);
    }

    // Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    if (this.footer) {
      if (typeof this.footer === 'string') {
        footer.innerHTML = this.footer;
      } else {
        footer.appendChild(this.footer);
      }
    } else {
      footer.innerHTML = `
        <button class="btn btn-secondary" data-action="close">Close</button>
      `;
    }

    footer.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'close') {
        this.close();
      }
    });

    // Assemble
    this.modal.appendChild(header);
    this.modal.appendChild(body);
    this.modal.appendChild(footer);
    
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
  }

  setContent(content) {
    const body = this.modal.querySelector('.modal-body');
    if (body) {
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else {
        body.innerHTML = '';
        body.appendChild(content);
      }
    }
  }

  setTitle(title) {
    const titleEl = this.modal.querySelector('.modal-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }
}
