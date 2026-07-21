class HistorySidebar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <aside id="history-sidebar" class="history-sidebar">
        <div class="sidebar-header">
          <h2>Calculation History</h2>
          <button id="btn-history-close" class="icon-btn" aria-label="Close history">
            <svg class="icon"><use href="#icon-close"></use></svg>
          </button>
        </div>
        <div id="history-list" class="history-list">
          <!-- History entries loaded dynamically -->
          <div class="empty-history-msg">No calculations yet. Perform basic calculations to build up history!</div>
        </div>
        <div class="sidebar-footer">
          <button id="btn-history-clear" class="danger-btn">Clear History</button>
        </div>
      </aside>
    `;
  }
}
customElements.define('history-sidebar', HistorySidebar);
