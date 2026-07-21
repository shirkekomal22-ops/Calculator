class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="app-header">
        <div class="logo">
          <img src="hello_kitty.png" alt="Hello Kitty" style="height: 36px; width: auto; object-fit: contain; margin-right: 6px; filter: drop-shadow(0 2px 4px rgba(219, 39, 119, 0.25));">
          <span class="logo-accent">AURA</span>
          <span class="logo-text">CALC</span>
        </div>
        <div class="controls">
          <button id="btn-history-toggle" class="icon-btn" aria-label="Toggle calculation history">
            <svg class="icon"><use href="#icon-history"></use></svg>
          </button>
          <button id="btn-theme-toggle" class="icon-btn" aria-label="Toggle color theme">
            <svg class="icon icon-moon"><use href="#icon-moon"></use></svg>
            <svg class="icon icon-sun" style="display: none;"><use href="#icon-sun"></use></svg>
          </button>
        </div>
      </header>
    `;
  }
}
customElements.define('app-header', AppHeader);
