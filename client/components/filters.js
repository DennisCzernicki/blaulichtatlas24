/**
 * Filter Component for Incident Management
 * Handles all filter-related UI interactions and state management
 */

class IncidentFilters {
  constructor() {
    this.categories = [];
    this.activeFilters = {
      last24h: true,
      categories: [],
      severity: 'low'
    };
    
    this.callbacks = {
      onFilterChange: () => {}
    };

    this.init();
  }

  /**
   * Initialize the filter component
   */
  async init() {
    try {
      await this.loadCategories();
      this.renderFilters();
      this.setupEventListeners();
      console.log('✅ Filter component initialized');
    } catch (error) {
      console.error('❌ Error initializing filters:', error);
    }
  }

  /**
   * Load available categories from API
   */
  async loadCategories() {
    try {
      const response = await fetch('/api/incidents/categories');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      this.categories = result.data;
      
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
  }

  /**
   * Render complete filter interface with custom styling
   */
  renderFilters() {
    const filterHTML = `
      <!-- Time Filter -->
      <div class="filter-section">
        <h3 class="filter-label">
          <span class="icon">🕑</span>
          Zeitraum
        </h3>
        <div class="checkbox-group">
          <label class="checkbox-item">
            <input type="checkbox" id="last24h" checked>
            <span class="checkmark"></span>
            <span class="checkbox-text">Nur letzte 24 Stunden</span>
          </label>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="filter-section">
        <h3 class="filter-label">
          <span class="icon">🏷️</span>
          Kategorien
        </h3>
        <div id="categoryFilters" class="category-filters">
          ${this.renderCategoryFiltersHTML()}
        </div>
      </div>

      <!-- Severity Filter -->
      <div class="filter-section">
        <h3 class="filter-label">
          <span class="icon">⚠️</span>
          Schweregrad
        </h3>
        <select class="custom-select" id="severityFilter">
          <option value="low">Alle anzeigen</option>
          <option value="medium">Mittel und höher</option>
          <option value="high">Hoch und höher</option>
          <option value="critical">Nur kritisch</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="filter-section">
        <button class="btn btn-secondary" id="clearFilters" style="width: 100%; margin-bottom: var(--space-md);">
          <span class="btn-icon">↺</span>
          Filter zurücksetzen
        </button>
        <button class="btn btn-primary" id="refreshData" style="width: 100%;">
          <span class="btn-icon">🔄</span>
          Aktualisieren
        </button>
      </div>

      <!-- Statistics -->
      <div class="statistics-section">
        <h3 class="stats-title">
          <span class="icon">📊</span>
          Statistiken
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number" id="totalIncidents">-</div>
            <div class="stat-label">Gesamt</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" id="visibleIncidents">-</div>
            <div class="stat-label">Angezeigt</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" id="activeIncidents">-</div>
            <div class="stat-label">Aktiv</div>
          </div>
        </div>
      </div>
    `;

    // Insert into both desktop and mobile containers
    const desktopContainer = document.getElementById('desktopFilters');
    const mobileContainer = document.getElementById('mobileFilters');
    
    if (desktopContainer) {
      desktopContainer.innerHTML = filterHTML;
    }
    
    if (mobileContainer) {
      // For mobile, wrap in padding container
      mobileContainer.innerHTML = `<div style="padding: var(--space-xl);">${filterHTML}</div>`;
    }
  }

  /**
   * Render category filter checkboxes HTML
   */
  renderCategoryFiltersHTML() {
    if (!this.categories.length) {
      return `
        <div class="loading-categories">
          <span class="icon">⏳</span>
          <span class="loading-text">Lädt Kategorien...</span>
        </div>
      `;
    }

    return this.categories.map(category => `
      <label class="category-filter">
        <input class="category-checkbox" type="checkbox" 
               id="category-${category.id}" value="${category.id}">
        <span class="category-color" style="background-color: ${category.color};"></span>
        <span class="category-text">${category.name}</span>
      </label>
    `).join('');
  }

  /**
   * Render category filter checkboxes
   */
  renderCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    container.innerHTML = '';

    this.categories.forEach(category => {
      const filterItem = document.createElement('div');
      filterItem.className = 'category-filter-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `category-${category.id}`;
      checkbox.value = category.id;
      checkbox.className = 'category-checkbox';
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.className = 'category-label';
      
      const colorIndicator = document.createElement('span');
      colorIndicator.className = 'category-color';
      colorIndicator.style.backgroundColor = category.color;
      
      const labelText = document.createElement('span');
      labelText.className = 'category-text';
      labelText.textContent = category.name;
      labelText.title = category.description;
      
      label.appendChild(checkbox);
      label.appendChild(colorIndicator);
      label.appendChild(labelText);
      
      filterItem.appendChild(label);
      container.appendChild(filterItem);
    });
  }

  /**
   * Render error state for category filters
   */
  renderCategoryFiltersError() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    container.innerHTML = `
      <div class="filter-error">
        <p>⚠️ Kategorien konnten nicht geladen werden</p>
      </div>
    `;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Time filter
    const last24hCheckbox = document.getElementById('last24h');
    if (last24hCheckbox) {
      last24hCheckbox.addEventListener('change', () => {
        this.activeFilters.last24h = last24hCheckbox.checked;
        this.onFilterChange();
      });
    }

    // Severity filter
    const severitySelect = document.getElementById('severityFilter');
    if (severitySelect) {
      severitySelect.addEventListener('change', () => {
        this.activeFilters.severity = severitySelect.value;
        this.onFilterChange();
      });
    }

    // Category filters (delegated event listener)
    const categoryContainer = document.getElementById('categoryFilters');
    if (categoryContainer) {
      categoryContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('category-checkbox')) {
          this.updateCategoryFilters();
          this.onFilterChange();
        }
      });
    }

    // Clear filters button
    const clearButton = document.getElementById('clearFilters');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }

    // Refresh data button
    const refreshButton = document.getElementById('refreshData');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.callbacks.onRefresh?.();
      });
    }
  }

  /**
   * Setup filter panel toggle functionality
   */
  setupFilterToggle() {
    const toggleButton = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');
    const filterContent = document.getElementById('filterContent');
    
    if (!toggleButton || !filterPanel || !filterContent) return;

    toggleButton.addEventListener('click', () => {
      const isCollapsed = filterPanel.classList.contains('collapsed');
      
      if (isCollapsed) {
        filterPanel.classList.remove('collapsed');
        toggleButton.querySelector('.toggle-icon').textContent = '◀';
        toggleButton.setAttribute('aria-label', 'Filter ausblenden');
      } else {
        filterPanel.classList.add('collapsed');
        toggleButton.querySelector('.toggle-icon').textContent = '▶';
        toggleButton.setAttribute('aria-label', 'Filter einblenden');
      }
    });

    // Auto-collapse on small screens
    this.handleResponsiveToggle();
    window.addEventListener('resize', () => this.handleResponsiveToggle());
  }

  /**
   * Handle responsive filter panel behavior
   */
  handleResponsiveToggle() {
    const filterPanel = document.getElementById('filterPanel');
    if (!filterPanel) return;

    if (window.innerWidth <= 768) {
      filterPanel.classList.add('collapsed');
    } else {
      filterPanel.classList.remove('collapsed');
    }
  }

  /**
   * Update category filters array
   */
  updateCategoryFilters() {
    const checkboxes = document.querySelectorAll('.category-checkbox:checked');
    this.activeFilters.categories = Array.from(checkboxes).map(cb => cb.value);
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    // Reset time filter
    const last24hCheckbox = document.getElementById('last24h');
    if (last24hCheckbox) {
      last24hCheckbox.checked = true;
      this.activeFilters.last24h = true;
    }

    // Reset category filters
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    categoryCheckboxes.forEach(cb => cb.checked = false);
    this.activeFilters.categories = [];

    // Reset severity filter
    const severitySelect = document.getElementById('severityFilter');
    if (severitySelect) {
      severitySelect.value = 'low';
      this.activeFilters.severity = 'low';
    }

    this.onFilterChange();
  }

  /**
   * Get current filter state
   */
  getActiveFilters() {
    return { ...this.activeFilters };
  }

  /**
   * Set callback for filter changes
   */
  onFilterChange(callback) {
    if (typeof callback === 'function') {
      this.callbacks.onFilterChange = callback;
    } else {
      // Called when filters actually change
      this.callbacks.onFilterChange(this.getActiveFilters());
    }
  }

  /**
   * Set callback for refresh action
   */
  onRefresh(callback) {
    this.callbacks.onRefresh = callback;
  }

  /**
   * Update statistics display
   */
  updateStatistics(stats) {
    const elements = {
      totalIncidents: document.getElementById('totalIncidents'),
      visibleIncidents: document.getElementById('visibleIncidents'),
      activeIncidents: document.getElementById('activeIncidents')
    };

    if (elements.totalIncidents) {
      elements.totalIncidents.textContent = stats.total || '-';
    }
    
    if (elements.visibleIncidents) {
      elements.visibleIncidents.textContent = stats.visible || '-';
    }
    
    if (elements.activeIncidents) {
      elements.activeIncidents.textContent = stats.active || '-';
    }
  }

  /**
   * Show loading state
   */
  showLoadingState() {
    const refreshButton = document.getElementById('refreshData');
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.innerHTML = '<span class="btn-icon">⏳</span> Lädt...';
      refreshButton.style.opacity = '0.6';
    }
  }

  /**
   * Hide loading state
   */
  hideLoadingState() {
    const refreshButton = document.getElementById('refreshData');
    if (refreshButton) {
      refreshButton.disabled = false;
      refreshButton.innerHTML = '<span class="btn-icon">🔄</span> Aktualisieren';
      refreshButton.style.opacity = '1';
    }
  }

  /**
   * Build query string for API from active filters
   */
  buildAPIQuery() {
    const params = new URLSearchParams();
    
    if (this.activeFilters.last24h) {
      params.set('last24h', 'true');
    } else {
      params.set('last24h', 'false');
    }
    
    if (this.activeFilters.categories.length > 0) {
      params.set('category', this.activeFilters.categories.join(','));
    }
    
    if (this.activeFilters.severity && this.activeFilters.severity !== 'low') {
      params.set('severity', this.activeFilters.severity);
    }
    
    return params.toString();
  }

  /**
   * Get category configuration by ID
   */
  getCategoryById(categoryId) {
    return this.categories.find(cat => cat.id === categoryId);
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return [...this.categories];
  }
}

// Make IncidentFilters available globally
window.IncidentFilters = IncidentFilters;
