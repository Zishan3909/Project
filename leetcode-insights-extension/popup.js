document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle-insights');

  // Load current state
  chrome.storage.local.get(['insightsEnabled'], (result) => {
    // Default to true if not set
    toggle.checked = result.insightsEnabled !== false;
  });

  // Save state on change
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ insightsEnabled: toggle.checked });
  });
});
