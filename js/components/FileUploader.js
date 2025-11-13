/* ============================================
   FILEUPLOADER.JS - File Upload Component
   CD-1 Rezoning Application Checker
   ============================================ */

import { FILE_UPLOAD, VALIDATION_MESSAGES } from '../config/constants.js';

export class FileUploader {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onUpload = options.onUpload || null;
    this.onRemove = options.onRemove || null;
    this.maxSize = options.maxSize || FILE_UPLOAD.MAX_SIZE;
    this.allowedTypes = options.allowedTypes || FILE_UPLOAD.ALLOWED_TYPES;
    this.file = null;
    
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="file-upload" id="dropzone">
        <div class="upload-icon">📁</div>
        <div class="upload-text">Click to upload or drag and drop</div>
        <div class="upload-hint">Accepted: ${this.allowedTypes.join(', ')} (Max ${this.maxSize / (1024 * 1024)}MB)</div>
        <input type="file" id="fileInput" style="display: none;" accept="${this.allowedTypes.join(',')}">
      </div>
      <div id="uploadedFile" style="display: none;"></div>
      <div id="uploadError" class="form-error" style="display: none;"></div>
    `;
  }

  attachEventListeners() {
    const dropzone = this.container.querySelector('#dropzone');
    const fileInput = this.container.querySelector('#fileInput');

    // Click to upload
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    // File selected
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.handleFile(file);
      }
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (file) {
        this.handleFile(file);
      }
    });
  }

  handleFile(file) {
    // Validate file size
    if (file.size > this.maxSize) {
      this.showError(VALIDATION_MESSAGES.FILE_TOO_LARGE(this.maxSize / (1024 * 1024)));
      return;
    }

    // Validate file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!this.allowedTypes.includes(fileExt)) {
      this.showError(VALIDATION_MESSAGES.INVALID_FILE_TYPE(this.allowedTypes));
      return;
    }

    this.file = file;
    this.displayFile(file);
    this.hideError();

    if (this.onUpload) {
      this.onUpload(file);
    }
  }

  displayFile(file) {
    const dropzone = this.container.querySelector('#dropzone');
    const uploadedFile = this.container.querySelector('#uploadedFile');

    dropzone.style.display = 'none';
    uploadedFile.style.display = 'block';

    uploadedFile.innerHTML = `
      <div class="uploaded-file">
        <div class="file-info">
          <span class="file-icon">📄</span>
          <div>
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
          </div>
        </div>
        <button class="file-remove" type="button">Remove</button>
      </div>
    `;

    const removeBtn = uploadedFile.querySelector('.file-remove');
    removeBtn.addEventListener('click', () => {
      this.removeFile();
    });
  }

  removeFile() {
    this.file = null;
    
    const dropzone = this.container.querySelector('#dropzone');
    const uploadedFile = this.container.querySelector('#uploadedFile');
    const fileInput = this.container.querySelector('#fileInput');

    dropzone.style.display = 'block';
    uploadedFile.style.display = 'none';
    fileInput.value = '';

    if (this.onRemove) {
      this.onRemove();
    }
  }

  showError(message) {
    const errorEl = this.container.querySelector('#uploadError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  hideError() {
    const errorEl = this.container.querySelector('#uploadError');
    errorEl.style.display = 'none';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFile() {
    return this.file;
  }

  reset() {
    this.removeFile();
  }
}
