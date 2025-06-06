// Text Analyzer Frontend JavaScript

document.addEventListener('DOMContentLoaded', function () {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    });
  }, 5000);
  const analyzerForm = document.getElementById('analyzer-form');
  if (analyzerForm) {
    analyzerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const textInput = document.getElementById('text-input').value.trim();
      if (!textInput) {
        showAlert('Please enter some text to analyze', 'danger');
        return;
      }

      const submitBtn = document.getElementById('analyze-btn');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...';
      fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
        credentials: 'same-origin'
      })
        .then(response => {
          if (!response.ok) {
            if (response.status === 401) {
              window.location.href = '/login';
              throw new Error('Authentication required');
            }
            return response.json().then(err => { throw new Error(err.message || 'Error analyzing text'); });
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            displayAnalysisResults(data.data, textInput);
          } else {
            showAlert(data.message || 'Error analyzing text', 'danger');
          }
        })
        .catch(error => {
          showAlert(error.message, 'danger');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        });
    });
  }
  const refreshHistoryBtn = document.getElementById('refresh-history');
  if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', function () {
      window.location.reload();
    });
  }
  setupHistoryItemHandlers();
});

function displayAnalysisResults(results, text) {
  const resultSection = document.getElementById('analysis-result');

  if (resultSection) {
    document.getElementById('word-count').textContent = results.word_count;
    document.getElementById('char-count').textContent = results.character_count;
    document.getElementById('sentence-count').textContent = results.sentence_count;
    document.getElementById('paragraph-count').textContent = results.paragraph_count;
    document.getElementById('longest-word').textContent = results.longest_word || 'N/A';

    resultSection.style.display = 'block';
    resultSection.classList.add('animate__animated', 'animate__fadeIn');
    resultSection.scrollIntoView({ behavior: 'smooth' });

    const saveBtn = document.getElementById('save-analysis');
    if (saveBtn) {
      saveBtn.onclick = function () {
        saveAnalysis(text);
      };
    }
  }
}

function saveAnalysis(text) {
  const saveBtn = document.getElementById('save-analysis');
  const originalBtnText = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

  fetch('/api/analyzer/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
    }),
    credentials: 'same-origin'
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        return response.json().then(err => { throw new Error(err.message || 'Error saving analysis'); });
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showAlert('Analysis saved successfully!', 'success');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';

        document.getElementById('text-input').value = '';
        resetAnalysisResults();
      } else {
        showAlert(data.message || 'Error saving analysis', 'danger');
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
      }
    })
    .catch(error => {
      showAlert(error.message, 'danger');
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnText;
    });
}

function resetAnalysisResults() {
  document.getElementById('word-count').textContent = '0';
  document.getElementById('char-count').textContent = '0';
  document.getElementById('sentence-count').textContent = '0';
  document.getElementById('paragraph-count').textContent = '0';
  document.getElementById('longest-word').textContent = '-';
  document.getElementById('analysis-result').style.display = 'none';
}

function setupHistoryItemHandlers() {
  const viewDetailsBtns = document.querySelectorAll('.view-details');

  viewDetailsBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const row = this.closest('tr');

      const id = row.getAttribute('data-history-id');
      const text = row.getAttribute('data-text');
      const wordCount = row.getAttribute('data-word-count');
      const charCount = row.getAttribute('data-char-count');
      const sentenceCount = row.getAttribute('data-sentence-count');
      const paragraphCount = row.getAttribute('data-paragraph-count');
      const longestWord = row.getAttribute('data-longest-word');
      const date = row.getAttribute('data-date');

      document.getElementById('detail-text').textContent = text;
      document.getElementById('detail-word-count').textContent = wordCount;
      document.getElementById('detail-char-count').textContent = charCount;
      document.getElementById('detail-sentence-count').textContent = sentenceCount;
      document.getElementById('detail-paragraph-count').textContent = paragraphCount;
      document.getElementById('detail-longest-word').textContent = longestWord;
      document.getElementById('detail-date').textContent = date;

      const detailModal = new bootstrap.Modal(document.getElementById('history-detail-modal'));
      detailModal.show();
    });
  });
}

function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');

  if (alertContainer) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alert);

    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => {
        alertContainer.removeChild(alert);
      }, 150);
    }, 5000);
  }
}
