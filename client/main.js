/**
 * Main Application JavaScript for Blaulicht Atlas 24
 * Handles map initialization, incident data fetching, and UI interactions
 */

class BlauLichtAtlas {
  constructor() {
    this.map = null;
    this.incidents = [];
    this.markers = [];
    this.filters = null;
    this.refreshInterval = null;
    
    // Configuration
    this.config = {
      center: [51.1657, 10.4515], // Center of Germany
      zoom: 6,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      maxZoom: 18,
      minZoom: 5
    };

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Blaulicht Atlas 24...');
      
      this.showLoadingOverlay();
      this.initializeMap();
      this.initializeFilters();
      this.setupEventListeners();
      this.setupStatusIndicator();
      
      await this.loadIncidents();
      this.startAutoRefresh();
      
      this.hideLoadingOverlay();
      console.log('✅ Application initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing application:', error);
      this.showError('Anwendung konnte nicht gestartet werden', error.message);
    }
  }

  /**
   * Initialize the Leaflet map
   */
  initializeMap() {
    console.log('🗺️ Initializing map...');
    
    this.map = L.map('map', {
      center: this.config.center,
      zoom: this.config.zoom,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
      zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',
      maxZoom: this.config.maxZoom
    }).addTo(this.map);

    // Add zoom controls
    this.map.zoomControl.setPosition('topright');

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      metric: true,
      imperial: false
    }).addTo(this.map);

    console.log('✅ Map initialized');
  }

  /**
   * Initialize the filters component
   */
  initializeFilters() {
    this.filters = new IncidentFilters();
    
    this.filters.onFilterChange((activeFilters) => {
      console.log('🎛️ Filters changed:', activeFilters);
      this.applyFilters();
    });

    this.filters.onRefresh(() => {
      this.refreshData();
    });
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Modal controls
    this.setupModalControls();
    
    // Retry button
    const retryButton = document.getElementById('retryLoad');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.hideErrorOverlay();
        this.loadIncidents();
      });
    }

    // Window beforeunload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * Setup modal controls
   */
  setupModalControls() {
    const modal = document.getElementById('incidentModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Mobile filter controls
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    const mobileFilterPanel = document.getElementById('mobileFilterPanel');
    const mobileFilterClose = document.getElementById('mobileFilterClose');

    // Modal close handlers
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeModal());
    }

    // Mobile filter handlers
    if (mobileFilterToggle) {
      mobileFilterToggle.addEventListener('click', () => this.openMobileFilters());
    }

    if (mobileFilterClose) {
      mobileFilterClose.addEventListener('click', () => this.closeMobileFilters());
    }

    if (mobileFilterPanel) {
      mobileFilterPanel.addEventListener('click', (e) => {
        if (e.target === mobileFilterPanel) {
          this.closeMobileFilters();
        }
      });
    }

    // ESC key to close modal or mobile filters
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        } else if (mobileFilterPanel && !mobileFilterPanel.classList.contains('hidden')) {
          this.closeMobileFilters();
        }
      }
    });
  }

  /**
   * Setup status indicator
   */
  setupStatusIndicator() {
    this.updateStatus('connecting', 'Verbinde...');
  }

  /**
   * Load incidents from API
   */
  async loadIncidents() {
    try {
      console.log('📡 Loading incidents...');
      this.showLoadingOverlay();
      this.filters?.showLoadingState();
      this.updateStatus('loading', 'Lädt Daten...');

      const queryString = this.filters?.buildAPIQuery() || '';
      const url = `/api/incidents${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'API returned error');
      }

      this.incidents = result.data || [];
      console.log(`✅ Loaded ${this.incidents.length} incidents`);
      
      this.updateMarkers();
      this.updateStatistics();
      this.updateLastUpdateTime();
      this.updateStatus('connected', `${this.incidents.length} Einsätze geladen`);
      
    } catch (error) {
      console.error('❌ Error loading incidents:', error);
      this.updateStatus('error', 'Fehler beim Laden');
      this.showError('Daten konnten nicht geladen werden', error.message);
    } finally {
      this.hideLoadingOverlay();
      this.filters?.hideLoadingState();
    }
  }

  /**
   * Update map markers
   */
  updateMarkers() {
    // Clear existing markers
    this.clearMarkers();

    // Add new markers
    this.incidents.forEach(incident => {
      const marker = this.createMarker(incident);
      if (marker) {
        this.markers.push(marker);
        marker.addTo(this.map);
      }
    });

    console.log(`🗺️ Updated ${this.markers.length} markers on map`);
  }

  /**
   * Create marker for incident
   */
  createMarker(incident) {
    if (!incident.coordinates || !incident.coordinates.lat || !incident.coordinates.lng) {
      console.warn('⚠️ Invalid coordinates for incident:', incident.id);
      return null;
    }

    const category = this.filters?.getCategoryById(incident.category);
    const color = category?.color || '#6b7280';
    
    // Create custom icon
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-pin severity-${incident.severity}" style="background-color: ${color}">
          <div class="marker-pulse"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], {
      icon: icon
    });

    // Add popup
    const popupContent = this.createPopupContent(incident);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'incident-popup'
    });

    // Add click handler for modal
    marker.on('click', () => {
      this.showIncidentModal(incident);
    });

    return marker;
  }

  /**
   * Create popup content for marker
   */
  createPopupContent(incident) {
    const timeAgo = this.formatTimeAgo(incident.timestamp);
    const category = this.filters?.getCategoryById(incident.category);
    const categoryName = category?.name || incident.category;

    return `
      <div class="popup-content">
        <h4 class="popup-title">${incident.title}</h4>
        <div class="popup-meta">
          <span class="popup-category">${categoryName}</span>
          <span class="popup-severity severity-${incident.severity}">${incident.severity}</span>
        </div>
        <p class="popup-location">📍 ${incident.location.city}, ${incident.location.address}</p>
        <p class="popup-time">⏰ ${timeAgo}</p>
        <p class="popup-description">${incident.description}</p>
        <button class="popup-details-btn" onclick="window.blauLichtAtlas.showIncidentModal('${incident.id}')">
          Mehr Details →
        </button>
      </div>
    `;
  }

  /**
   * Show incident details modal
   */
  showIncidentModal(incidentOrId) {
    let incident;
    
    if (typeof incidentOrId === 'string') {
      incident = this.incidents.find(inc => inc.id === incidentOrId);
    } else {
      incident = incidentOrId;
    }
    
    if (!incident) {
      console.error('❌ Incident not found:', incidentOrId);
      return;
    }

    const modal = document.getElementById('incidentModal');
    const modalTitle = document.getElementById('incidentModalLabel');
    const modalBody = document.getElementById('modalBody');
    const showOnMapBtn = document.getElementById('showOnMapBtn');

    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.innerHTML = `
      <span class="icon">ℹ️</span>
      ${incident.title}
    `;
    modalBody.innerHTML = this.createCustomModalContent(incident);
    
    // Setup show on map button
    if (showOnMapBtn) {
      showOnMapBtn.onclick = () => {
        this.centerMapOnIncident(incident.id);
        this.closeModal();
      };
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Create custom modal content for incident
   */
  createCustomModalContent(incident) {
    const timeAgo = this.formatTimeAgo(incident.timestamp);
    const exactTime = new Date(incident.timestamp).toLocaleString('de-DE');
    const category = this.filters?.getCategoryById(incident.category);
    const categoryName = category?.name || incident.category;

    return `
      <div class="modal-details">
        <!-- Basic Information Section -->
        <div class="detail-section">
          <h3 class="section-title">
            <span class="section-icon">📋</span>
            Grundinformationen
          </h3>
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-item">
                <label class="detail-label">Kategorie:</label>
                <div class="detail-value">
                  <span class="category-indicator" style="background-color: ${category?.color || '#6b7280'};"></span>
                  <span>${categoryName}</span>
                </div>
              </div>
              <div class="detail-item">
                <label class="detail-label">Schweregrad:</label>
                <div class="detail-value">
                  <span class="severity-badge severity-${incident.severity}">${this.getSeverityText(incident.severity)}</span>
                </div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <label class="detail-label">Status:</label>
                <div class="detail-value">
                  <span class="status-badge ${incident.status === 'active' ? 'status-active' : 'status-inactive'}">${incident.status === 'active' ? 'Aktiv' : 'Beendet'}</span>
                </div>
              </div>
              <div class="detail-item">
                <label class="detail-label">Beamte vor Ort:</label>
                <div class="detail-value">${incident.officers_dispatched || 'Unbekannt'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location & Time Section -->
        <div class="detail-section">
          <h3 class="section-title">
            <span class="section-icon">📍</span>
            Ort & Zeit
          </h3>
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-item">
                <label class="detail-label">Stadt:</label>
                <div class="detail-value">${incident.location.city}</div>
              </div>
              <div class="detail-item">
                <label class="detail-label">Bundesland:</label>
                <div class="detail-value">${incident.location.state}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item full-width">
                <label class="detail-label">Adresse:</label>
                <div class="detail-value">${incident.location.address}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item full-width">
                <label class="detail-label">Zeitpunkt:</label>
                <div class="detail-value">
                  <div class="time-primary">${exactTime}</div>
                  <div class="time-relative">${timeAgo}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="detail-section">
          <h3 class="section-title">
            <span class="section-icon">📝</span>
            Beschreibung
          </h3>
          <div class="description-content">
            <p>${incident.description}</p>
          </div>
        </div>

        <!-- Additional Information Section -->
        <div class="detail-section">
          <h3 class="section-title">
            <span class="section-icon">ℹ️</span>
            Weitere Informationen
          </h3>
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-item">
                <label class="detail-label">Einsatz-ID:</label>
                <div class="detail-value">
                  <code class="incident-id">${incident.id}</code>
                </div>
              </div>
              <div class="detail-item">
                <label class="detail-label">Quelle:</label>
                <div class="detail-value">${incident.source || 'Unbekannt'}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item full-width">
                <label class="detail-label">Gemeldet von:</label>
                <div class="detail-value">${this.getReportedByText(incident.reported_by)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create modal content for incident
   */
  createModalContent(incident) {
    const timeAgo = this.formatTimeAgo(incident.timestamp);
    const exactTime = new Date(incident.timestamp).toLocaleString('de-DE');
    const category = this.filters?.getCategoryById(incident.category);
    const categoryName = category?.name || incident.category;

    return `
      <div class="modal-incident-details">
        <div class="detail-section">
          <h3>📋 Grundinformationen</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Kategorie:</span>
              <span class="detail-value">
                <span class="category-indicator" style="background-color: ${category?.color || '#6b7280'}"></span>
                ${categoryName}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Schweregrad:</span>
              <span class="detail-value severity-${incident.severity}">${incident.severity}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value status-${incident.status}">${incident.status}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Beamte vor Ort:</span>
              <span class="detail-value">${incident.officers_dispatched || 'Unbekannt'}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>📍 Ort & Zeit</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Stadt:</span>
              <span class="detail-value">${incident.location.city}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Adresse:</span>
              <span class="detail-value">${incident.location.address}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Bundesland:</span>
              <span class="detail-value">${incident.location.state}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Zeit:</span>
              <span class="detail-value">${exactTime} (${timeAgo})</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>📝 Beschreibung</h3>
          <p class="detail-description">${incident.description}</p>
        </div>

        <div class="detail-section">
          <h3>ℹ️ Weitere Informationen</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Einsatz-ID:</span>
              <span class="detail-value detail-id">${incident.id}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Quelle:</span>
              <span class="detail-value">${incident.source || 'Unbekannt'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Gemeldet von:</span>
              <span class="detail-value">${incident.reported_by || 'Unbekannt'}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="window.blauLichtAtlas.centerMapOnIncident('${incident.id}')">
            📍 Auf Karte anzeigen
          </button>
          <button class="btn btn-primary" onclick="window.blauLichtAtlas.closeModal()">
            Schließen
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('incidentModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Center map on specific incident
   */
  centerMapOnIncident(incidentId) {
    const incident = this.incidents.find(inc => inc.id === incidentId);
    if (!incident || !incident.coordinates) return;

    this.map.setView([incident.coordinates.lat, incident.coordinates.lng], 15);
    this.closeModal();

    // Briefly highlight the marker
    const marker = this.markers.find(m => {
      const latLng = m.getLatLng();
      return Math.abs(latLng.lat - incident.coordinates.lat) < 0.0001 &&
             Math.abs(latLng.lng - incident.coordinates.lng) < 0.0001;
    });

    if (marker) {
      marker.openPopup();
    }
  }

  /**
   * Apply current filters to displayed incidents
   */
  applyFilters() {
    // The API handles filtering, so we need to reload data
    this.loadIncidents();
  }

  /**
   * Refresh data manually
   */
  refreshData() {
    console.log('🔄 Manual data refresh triggered');
    this.loadIncidents();
  }

  /**
   * Start automatic refresh
   */
  startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      this.loadIncidents();
    }, this.config.refreshInterval);

    console.log(`⏰ Auto-refresh started (${this.config.refreshInterval / 1000}s interval)`);
  }

  /**
   * Clear all markers from map
   */
  clearMarkers() {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  /**
   * Update statistics display
   */
  updateStatistics() {
    const activeIncidents = this.incidents.filter(inc => inc.status === 'active').length;
    
    this.filters?.updateStatistics({
      total: this.incidents.length,
      visible: this.incidents.length,
      active: activeIncidents
    });
  }

  /**
   * Update last update time
   */
  updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
      lastUpdateElement.textContent = new Date().toLocaleString('de-DE');
    }
  }

  /**
   * Update status indicator
   */
  updateStatus(status, message) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (statusDot) {
      statusDot.className = `status-dot status-${status}`;
    }

    if (statusText) {
      statusText.textContent = message;
    }
  }

  /**
   * Open mobile filters panel
   */
  openMobileFilters() {
    const panel = document.getElementById('mobileFilterPanel');
    if (panel) {
      panel.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close mobile filters panel
   */
  closeMobileFilters() {
    const panel = document.getElementById('mobileFilterPanel');
    if (panel) {
      panel.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Show loading overlay
   */
  showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  /**
   * Show error overlay
   */
  showError(title, message) {
    const overlay = document.getElementById('errorOverlay');
    const errorMessage = document.getElementById('errorMessage');

    if (errorMessage) {
      errorMessage.textContent = message;
    }

    if (overlay) {
      overlay.classList.remove('hidden');
    }

    this.hideLoadingOverlay();
  }

  /**
   * Hide error overlay
   */
  hideErrorOverlay() {
    const overlay = document.getElementById('errorOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  /**
   * Format time ago helper
   */
  formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `vor ${diffMins} Min.`;
    } else if (diffHours < 24) {
      return `vor ${diffHours} Std.`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `vor ${diffDays} Tag(en)`;
    }
  }

  /**
   * Get Bootstrap badge class for severity
   */
  getSeverityBadgeClass(severity) {
    const classes = {
      'low': 'success',
      'medium': 'warning', 
      'high': 'danger',
      'critical': 'danger'
    };
    return classes[severity] || 'secondary';
  }

  /**
   * Get German text for severity
   */
  getSeverityText(severity) {
    const texts = {
      'low': 'Niedrig',
      'medium': 'Mittel',
      'high': 'Hoch',
      'critical': 'Kritisch'
    };
    return texts[severity] || severity;
  }

  /**
   * Get German text for reported by field
   */
  getReportedByText(reportedBy) {
    const texts = {
      'citizen_call': 'Bürger-Notruf',
      'patrol_observation': 'Streife vor Ort',
      'police_department': 'Polizeidienststelle',
      'emergency_services': 'Rettungsdienste'
    };
    return texts[reportedBy] || (reportedBy || 'Unbekannt');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.clearMarkers();
    
    if (this.map) {
      this.map.remove();
    }
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM Content Loaded - Starting BlauLichtAtlas...');
  console.log('📊 Available elements:');
  console.log('  - map element:', document.getElementById('map'));
  console.log('  - statusDot element:', document.getElementById('statusDot'));
  console.log('  - statusText element:', document.getElementById('statusText'));
  console.log('  - desktopFilters element:', document.getElementById('desktopFilters'));
  console.log('  - mobileFilters element:', document.getElementById('mobileFilters'));
  
  try {
    window.blauLichtAtlas = new BlauLichtAtlas();
    console.log('✅ BlauLichtAtlas instance created successfully');
  } catch (error) {
    console.error('❌ Error creating BlauLichtAtlas instance:', error);
  }
});
