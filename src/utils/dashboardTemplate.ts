export const generateDashboardHtml = (
  logs: any[],
  title: string = "Text Analyzer Logs"
) => {
  const logRows = logs
    .map((log) => {
      const level = log.level || "info";
      const timestamp = log.timestamp || new Date().toISOString();
      const message = log.message || "";

      let rowClass = "";
      switch (level.toLowerCase()) {
        case "error":
          rowClass = "table-danger";
          break;
        case "warn":
          rowClass = "table-warning";
          break;
        case "info":
          rowClass = "table-info";
          break;
        case "debug":
          rowClass = "table-light";
          break;
        default:
          rowClass = "";
      }

      return `
      <tr class="${rowClass}">
        <td><span class="text-muted small">${timestamp}</span></td>
        <td><span class="badge ${getBadgeClass(
          level
        )}">${level.toUpperCase()}</span></td>
        <td>
          <div class="d-flex align-items-center">
            <span class="log-icon me-2">${getLogIcon(level)}</span>
            <span class="log-message">${escapeHtml(message)}</span>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        :root {
          --primary-color: #3498db;
          --secondary-color: #2c3e50;
          --success-color: #2ecc71;
          --danger-color: #e74c3c;
          --warning-color: #f39c12;
          --info-color: #3498db;
          --light-color: #ecf0f1;
          --dark-color: #2c3e50;
          --border-radius: 8px;
          --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          padding: 0;
          margin: 0;
          color: #333;
          line-height: 1.6;
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 20px;
          border-radius: var(--border-radius) var(--border-radius) 0 0;
          margin-bottom: 20px;
          box-shadow: var(--box-shadow);
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }

        .dashboard-content {
          padding: 0 10px;
        }

        .card {
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          margin-bottom: 20px;
          border: none;
          overflow: hidden;
        }

        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          padding: 15px 20px;
          font-weight: 500;
          color: var(--secondary-color);
        }

        .card-body {
          padding: 20px;
        }

        .form-label {
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--secondary-color);
        }

        .form-control, .form-select {
          border-radius: var(--border-radius);
          border: 1px solid #ced4da;
          padding: 10px 15px;
          transition: var(--transition);
        }

        .form-control:focus, .form-select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.25rem rgba(52, 152, 219, 0.25);
        }

        .input-group-text {
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: var(--border-radius) 0 0 var(--border-radius);
        }

        .btn {
          border-radius: var(--border-radius);
          padding: 10px 15px;
          font-weight: 500;
          transition: var(--transition);
        }

        .btn-primary {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .btn-primary:hover {
          background-color: #2980b9;
          border-color: #2980b9;
        }

        .btn-secondary {
          background-color: #95a5a6;
          border-color: #95a5a6;
        }

        .btn-secondary:hover {
          background-color: #7f8c8d;
          border-color: #7f8c8d;
        }

        .log-container {
          background-color: white;
          overflow: auto;
          max-height: 60vh;
          border-radius: 0 0 var(--border-radius) var(--border-radius);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .filter-container {
          margin-bottom: 1.5rem;
        }

        .refresh-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .badge {
          font-size: 0.85em;
          padding: 0.35em 0.65em;
          font-weight: 500;
        }

        .table {
          margin-bottom: 0;
        }

        .table thead th {
          position: sticky;
          top: 0;
          background-color: var(--secondary-color);
          color: white;
          font-weight: 500;
          border-color: rgba(255,255,255,0.1);
        }

        .table-hover tbody tr:hover {
          background-color: rgba(0,0,0,0.02);
        }

        .form-select, .form-control, .btn {
          border-radius: 6px;
          padding: 0.5rem 1rem;
        }

        .btn-primary {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .btn-secondary {
          background-color: var(--secondary-color);
          border-color: var(--secondary-color);
        }

        .btn-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .last-updated {
          color: #6c757d;
          font-size: 0.9rem;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }

          .dashboard-content {
            padding: 1rem;
          }

          .refresh-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .refresh-container > div:last-child {
            margin-top: 0.5rem;
            width: 100%;
          }

          .btn-sm {
            padding: 0.375rem 0.75rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="dashboard-container">
        <header class="dashboard-header">
          <h1><i class="fas fa-chart-line me-2"></i>${title}</h1>
        </header>

        <main class="dashboard-content">
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="fas fa-sliders-h me-2"></i>Dashboard Controls</span>
              <span class="last-updated" id="last-updated"><i class="far fa-clock me-1"></i>Last updated: ${new Date().toLocaleString()}</span>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-8">
                  <div class="filter-container">
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label for="level-filter" class="form-label">Log Level</label>
                        <select id="level-filter" class="form-select">
                          <option value="all">All Levels</option>
                          <option value="error">Error</option>
                          <option value="warn">Warning</option>
                          <option value="info">Info</option>
                          <option value="http">HTTP</option>
                          <option value="debug">Debug</option>
                        </select>
                      </div>
                      <div class="col-md-8">
                        <label for="message-filter" class="form-label">Message Filter</label>
                        <div class="input-group">
                          <span class="input-group-text"><i class="fas fa-search"></i></span>
                          <input type="text" id="message-filter" class="form-control" placeholder="Filter by message content...">
                          <button id="clear-filters" class="btn btn-secondary"><i class="fas fa-times me-1"></i>Clear</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Auto-refresh</label>
                  <div class="d-flex">
                    <select id="refresh-rate" class="form-select me-2">
                      <option value="0">Manual</option>
                      <option value="5000" selected>5 seconds</option>
                      <option value="10000">10 seconds</option>
                      <option value="30000">30 seconds</option>
                      <option value="60000">1 minute</option>
                    </select>
                    <button id="refresh-btn" class="btn btn-primary"><i class="fas fa-sync-alt me-1"></i>Refresh</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <i class="fas fa-list-alt me-2"></i>Log Entries
            </div>
            <div class="log-container">
              <table class="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th style="width: 200px;">Timestamp</th>
                    <th style="width: 100px;">Level</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody id="log-table-body">
                  ${logRows}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <script>
        let refreshInterval;
        let logData = [];
        const refreshBtn = document.getElementById('refresh-btn');
        const refreshRate = document.getElementById('refresh-rate');
        const levelFilter = document.getElementById('level-filter');
        const messageFilter = document.getElementById('message-filter');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const lastUpdatedEl = document.getElementById('last-updated');

        document.addEventListener('DOMContentLoaded', function() {
          document.querySelector('.dashboard-header').classList.add('animate__animated', 'animate__fadeIn');
          document.querySelector('.dashboard-content').classList.add('animate__animated', 'animate__fadeInUp');

          fetchLogs();
        });

        function fetchLogs() {
          refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
          refreshBtn.disabled = true;

          fetch(window.location.href + '/api')
            .then(response => response.json())
            .then(data => {
              logData = data.logs || [];
              updateLogTable();
              updateLastUpdated();

              refreshBtn.innerHTML = '<i class="fas fa-check me-1"></i> Updated';
              setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Refresh';
                refreshBtn.disabled = false;
              }, 1000);
            })
            .catch(error => {
              console.error('Error fetching logs:', error);
              refreshBtn.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i> Error';
              refreshBtn.classList.add('btn-danger');
              setTimeout(() => {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Retry';
                refreshBtn.classList.remove('btn-danger');
                refreshBtn.classList.add('btn-primary');
                refreshBtn.disabled = false;
              }, 2000);
            });
        }

        function updateLogTable() {
          const level = levelFilter.value;
          const message = messageFilter.value.toLowerCase();

          const filteredLogs = logData.filter(log => {
            const matchesLevel = level === 'all' || (log.level && log.level.toLowerCase() === level);
            const matchesMessage = !message || (log.message && log.message.toLowerCase().includes(message));
            return matchesLevel && matchesMessage;
          });
          const totalCount = logData.length;
          const filteredCount = filteredLogs.length;

          const tableBody = document.getElementById('log-table-body');

          if (filteredLogs.length === 0) {
            tableBody.innerHTML = '\
              <tr>\
                <td colspan="3" class="text-center py-4">\
                  <div class="text-muted">\
                    <i class="fas fa-search me-2"></i>No logs matching your filter criteria\
                  </div>\
                </td>\
              </tr>\
            ';
            return;
          }

          tableBody.innerHTML = filteredLogs.map(log => {
            const rowClass = getRowClass(log.level);
            return '\
              <tr class="' + rowClass + '">\' +
                '<td><span class="text-muted small">' + (log.timestamp || '') + '</span></td>\' +
                '<td><span class="badge ' + getBadgeClass(log.level) + '">' + (log.level ? log.level.toUpperCase() : '') + '</span></td>\' +
                '<td>\' +
                  '<div class="d-flex align-items-center">\' +
                    '<span class="log-icon me-2">' + getLogIcon(log.level) + '</span>\' +
                    '<span class="log-message">' + escapeHtml(log.message || '') + '</span>\' +
                  '</div>\' +
                '</td>\' +
              '</tr>\'
            ;
          }).join('');

          if (level !== 'all' || message) {
            const statsEl = document.createElement('div');
            statsEl.className = 'text-end small text-muted mt-2';
            statsEl.innerHTML = 'Showing ' + filteredCount + ' of ' + totalCount + ' logs';
            tableBody.parentNode.parentNode.appendChild(statsEl);
          }
        }

        function updateLastUpdated() {
          const now = new Date();
          const timeString = now.toLocaleTimeString();
          const dateString = now.toLocaleDateString();
          lastUpdatedEl.innerHTML = '<i class="far fa-clock me-1"></i>Last updated: ' + dateString + ' ' + timeString;
        }

        function getRowClass(level) {
          if (!level) return '';
          switch (level.toLowerCase()) {
            case 'error': return 'table-danger';
            case 'warn': return 'table-warning';
            case 'info': return 'table-info';
            case 'debug': return 'table-light';
            default: return '';
          }
        }

        function getBadgeClass(level) {
          if (!level) return 'bg-secondary';
          switch (level.toLowerCase()) {
            case 'error': return 'bg-danger';
            case 'warn': return 'bg-warning text-dark';
            case 'info': return 'bg-info text-dark';
            case 'http': return 'bg-primary';
            case 'debug': return 'bg-secondary';
            default: return 'bg-secondary';
          }
        }

        function escapeHtml(str) {
          if (!str) return '';
          return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }

        function getLogIcon(level) {
          if (!level) return '<i class="fas fa-info-circle"></i>';
          switch (level.toLowerCase()) {
            case 'error': return '<i class="fas fa-exclamation-circle text-danger"></i>';
            case 'warn': return '<i class="fas fa-exclamation-triangle text-warning"></i>';
            case 'info': return '<i class="fas fa-info-circle text-info"></i>';
            case 'http': return '<i class="fas fa-globe text-primary"></i>';
            case 'debug': return '<i class="fas fa-bug text-secondary"></i>';
            default: return '<i class="fas fa-info-circle"></i>';
          }
        }

        function setRefreshInterval() {
          clearInterval(refreshInterval);
          const rate = parseInt(refreshRate.value, 10);
          if (rate > 0) {
            refreshInterval = setInterval(fetchLogs, rate);
          }
        }

        refreshBtn.addEventListener('click', fetchLogs);
        refreshRate.addEventListener('change', setRefreshInterval);
        levelFilter.addEventListener('change', updateLogTable);
        messageFilter.addEventListener('input', updateLogTable);
        clearFiltersBtn.addEventListener('click', () => {
          levelFilter.value = 'all';
          messageFilter.value = '';
          updateLogTable();
        });

        setRefreshInterval();
      </script>
    </body>
    </html>
  `;
};

function getBadgeClass(level: string): string {
  if (!level) return "bg-secondary";
  switch (level.toLowerCase()) {
    case "error":
      return "bg-danger";
    case "warn":
      return "bg-warning text-dark";
    case "info":
      return "bg-info text-dark";
    case "http":
      return "bg-primary";
    case "debug":
      return "bg-secondary";
    default:
      return "bg-secondary";
  }
}

function getLogIcon(level: string): string {
  if (!level) return '<i class="fas fa-info-circle"></i>';
  switch (level.toLowerCase()) {
    case "error":
      return '<i class="fas fa-exclamation-circle text-danger"></i>';
    case "warn":
      return '<i class="fas fa-exclamation-triangle text-warning"></i>';
    case "info":
      return '<i class="fas fa-info-circle text-info"></i>';
    case "http":
      return '<i class="fas fa-globe text-primary"></i>';
    case "debug":
      return '<i class="fas fa-bug text-secondary"></i>';
    default:
      return '<i class="fas fa-info-circle"></i>';
  }
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
