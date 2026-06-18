// SpaceOps Satellite Ground Station Monitoring Portal - Client Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize System Clock (UTC time standard)
  initSystemClock();

  // 2. Initialize Sidebar Drawer Toggle for Mobile Viewports
  initSidebarToggle();

  // 3. Auto-dismiss Notification Alerts
  initAlertDismissals();

  // 4. Client-Side Form Validations
  initFormValidations();
});

// Real-Time UTC clock in ground station bar
function initSystemClock() {
  const clockElement = document.getElementById('clock');
  if (!clockElement) return;

  function updateClock() {
    const now = new Date();
    // Get UTC strings
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    clockElement.textContent = `UTC ${hours}:${minutes}:${seconds}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Mobile sidebar toggle drawer
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      sidebar.classList.toggle('active');
      e.stopPropagation();
    });

    // Close sidebar if user clicks outside of it on mobile
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
        sidebar.classList.remove('active');
      }
    });
  }
}

// Auto-dismiss alert boxes after 5 seconds
function initAlertDismissals() {
  const alerts = ['successAlert', 'errorAlert', 'formAlert', 'loginAlert'];
  
  alerts.forEach(alertId => {
    const alertEl = document.getElementById(alertId);
    if (alertEl) {
      setTimeout(() => {
        alertEl.style.transition = 'opacity 0.5s ease';
        alertEl.style.opacity = '0';
        setTimeout(() => alertEl.remove(), 500);
      }, 5000);
    }
  });
}

// Client-Side Live Search / Filtering on tables
function searchTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const filter = input.value.toLowerCase().trim();
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const rows = table.getElementsByTagName('tr');
  const emptyStateId = `${tableId}-empty`;
  let visibleCount = 0;

  // Iterate over data rows (skip header row at index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.id === emptyStateId) continue; // Skip custom empty row if present

    let match = false;
    const cells = row.getElementsByTagName('td');
    
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      if (cell) {
        // Exclude operations/action columns from search index
        if (cell.classList.contains('action-buttons') || cell.parentElement.classList.contains('actions-col')) {
          continue;
        }
        
        const textValue = cell.textContent || cell.innerText;
        if (textValue.toLowerCase().indexOf(filter) > -1) {
          match = true;
          break;
        }
      }
    }

    if (match) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  }

  // Handle empty search results visual state
  let existingEmptyRow = document.getElementById(emptyStateId);
  if (visibleCount === 0) {
    if (!existingEmptyRow) {
      const colSpan = table.querySelector('thead tr').children.length;
      const newRow = document.createElement('tr');
      newRow.id = emptyStateId;
      newRow.innerHTML = `
        <td colspan="${colSpan}" style="text-align: center; color: var(--text-muted); padding: 30px;">
          <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 24px; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
          No registry logs match the search query "${input.value}"
        </td>
      `;
      table.querySelector('tbody').appendChild(newRow);
    }
  } else {
    if (existingEmptyRow) {
      existingEmptyRow.remove();
    }
  }
}

// Client-Side custom form validations
function initFormValidations() {
  const satForm = document.getElementById('satelliteForm');
  if (satForm) {
    satForm.addEventListener('submit', (e) => {
      const nameInput = document.getElementById('satellite_name');
      if (nameInput && nameInput.value.trim().length === 0) {
        alert('Satellite designation name cannot be empty.');
        nameInput.focus();
        e.preventDefault();
      }
    });
  }

  const telForm = document.getElementById('telemetryForm');
  if (telForm) {
    telForm.addEventListener('submit', (e) => {
      const strengthInput = document.getElementById('signal_strength');
      if (strengthInput) {
        const val = parseFloat(strengthInput.value);
        if (isNaN(val) || val < -150.0 || val > 0.0) {
          alert('Signal strength must be a numerical reading between -150.00 dBm (weak) and 0.00 dBm (perfect link).');
          strengthInput.focus();
          e.preventDefault();
        }
      }
    });
  }
}
