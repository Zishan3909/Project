let insightsData = null;
let isEnabled = true;

async function loadData() {
  try {
    const url = chrome.runtime.getURL('data.json');
    const response = await fetch(url);
    insightsData = await response.json();
  } catch (error) {
    console.error("LeetCode Insights: Failed to load data", error);
  }
}

function getSlugFromHref(href) {
  // Matches both relative /problems/slug and absolute https://leetcode.com/problems/slug
  // Also correctly ignores query strings (?envType=...) or hashes
  const match = href.match(/\/problems\/([^/?#]+)/);
  return match ? match[1] : null;
}

function createBadge(companies) {
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'lc-insights-container';
  
  // Sort companies by freq desc, take top 3
  const topCompanies = companies.sort((a, b) => b.freq - a.freq).slice(0, 3);
  
  topCompanies.forEach(c => {
    const badge = document.createElement('span');
    badge.className = 'lc-insights-badge';
    
    // Add logo
    // Special cases for common domains if needed, but removing spaces and adding .com works for most.
    let domain = c.company.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + '.com';
    if (c.company.toLowerCase() === 'apple') domain = 'apple.com';
    if (c.company.toLowerCase() === 'amazon') domain = 'amazon.com';
    
    const img = document.createElement('img');
    img.src = `https://logo.clearbit.com/${domain}`;
    img.className = 'lc-company-logo';
    img.onerror = function() {
      this.style.display = 'none'; // hide if logo fails to load
    };
    
    const text = document.createElement('span');
    text.textContent = `${c.company} (${c.freq})`;
    
    badge.appendChild(img);
    badge.appendChild(text);
    badgeContainer.appendChild(badge);
  });
  
  return badgeContainer;
}

function injectFilterModal() {
  if (document.getElementById('lc-insights-fab')) return;

  // Floating Action Button
  const fab = document.createElement('div');
  fab.id = 'lc-insights-fab';
  fab.textContent = '🏢 Company Filter';
  fab.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #ffa116;
    color: #fff;
    padding: 12px 20px;
    border-radius: 24px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    font-family: inherit;
    transition: transform 0.2s;
  `;
  fab.onmouseover = () => fab.style.transform = 'scale(1.05)';
  fab.onmouseout = () => fab.style.transform = 'scale(1)';

  // Modal Container
  const modal = document.createElement('div');
  modal.style.cssText = `
    display: none;
    position: fixed;
    bottom: 80px;
    right: 24px;
    width: 350px;
    max-height: 500px;
    background: #282828;
    border: 1px solid #444;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    z-index: 10000;
    flex-direction: column;
    overflow: hidden;
    color: #eff1f6;
  `;

  // Modal Header
  const header = document.createElement('div');
  header.style.cssText = 'padding: 16px; border-bottom: 1px solid #444; display: flex; justify-content: space-between; align-items: center; background: #333;';
  header.innerHTML = '<span style="font-weight: bold; font-size: 16px;">Search by Company</span>';
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✖';
  closeBtn.style.cssText = 'cursor: pointer; color: #888;';
  closeBtn.onclick = () => modal.style.display = 'none';
  header.appendChild(closeBtn);

  // Search Input
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = 'padding: 16px;';
  const input = document.createElement('input');
  input.placeholder = "Type company (e.g. Google)...";
  input.style.cssText = `
    width: 100%;
    padding: 10px;
    background: #444;
    border: 1px solid #555;
    border-radius: 6px;
    color: #fff;
    outline: none;
    box-sizing: border-box;
  `;
  searchContainer.appendChild(input);

  // Results Area
  const results = document.createElement('div');
  results.style.cssText = 'flex: 1; overflow-y: auto; padding: 0 16px 16px 16px; display: flex; flex-direction: column; gap: 8px;';

  modal.appendChild(header);
  modal.appendChild(searchContainer);
  modal.appendChild(results);
  document.body.appendChild(fab);
  document.body.appendChild(modal);

  // Toggle Modal
  fab.onclick = () => {
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    if (modal.style.display === 'flex') input.focus();
  };

  // Search Logic
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    results.innerHTML = '';
    
    if (!query) return;

    let matches = [];
    for (const [slug, companies] of Object.entries(insightsData)) {
      const matchedCompany = companies.find(c => c.company.toLowerCase().includes(query));
      if (matchedCompany) {
        matches.push({ slug, company: matchedCompany.company, freq: matchedCompany.freq });
      }
    }
    
    matches.sort((a, b) => b.freq - a.freq);
    
    if (matches.length > 0) {
      matches.slice(0, 100).forEach(m => {
        const link = document.createElement('a');
        link.href = `/problems/${m.slug}/`;
        // Convert slug to Title Case
        const title = m.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        link.innerHTML = `<strong style="color: #ffa116">${title}</strong> <br> <span style="font-size: 12px; color: #aaa;">${m.company} (Freq: ${m.freq})</span>`;
        link.style.cssText = `
          display: block;
          padding: 10px;
          background: #333;
          border-radius: 6px;
          text-decoration: none;
          color: inherit;
        `;
        link.onmouseover = () => link.style.background = '#444';
        link.onmouseout = () => link.style.background = '#333';
        results.appendChild(link);
      });
    } else {
      results.innerHTML = '<div style="color: #888; text-align: center;">No questions found.</div>';
    }
  });
}

function processLinks(rootNode = document) {
  if (!isEnabled || !insightsData) return;

  const links = rootNode.querySelectorAll('a[href*="/problems/"]');
  
  links.forEach(link => {
    if (!link.textContent.trim()) return;
    if (link.parentElement.querySelector('.lc-insights-container')) return;

    const slug = getSlugFromHref(link.getAttribute('href'));
    if (slug && insightsData[slug]) {
      const badge = createBadge(insightsData[slug]);
      link.insertAdjacentElement('beforebegin', badge);
    }
  });
}

function removeBadges() {
  document.querySelectorAll('.lc-insights-container').forEach(el => el.remove());
}

async function init() {
  await loadData();
  
  // Load initial state
  chrome.storage.local.get(['insightsEnabled'], (result) => {
    isEnabled = result.insightsEnabled !== false; // Default to true
    if (isEnabled) {
      processLinks();
      injectFilterModal();
    }
  });

  // Listen for DOM changes (React SPA navigation)
  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;
    
    let shouldProcess = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldProcess = true;
        break;
      }
    }
    
    if (shouldProcess) {
      // Small debounce to avoid freezing the page
      clearTimeout(window.insightsTimeout);
      window.insightsTimeout = setTimeout(() => {
        processLinks();
        injectFilterModal();
      }, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for toggle events from popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.insightsEnabled) {
    isEnabled = changes.insightsEnabled.newValue;
    if (isEnabled) {
      processLinks();
    } else {
      removeBadges();
    }
  }
});

init();
