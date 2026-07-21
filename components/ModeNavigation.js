class ModeNavigation extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="mode-navigation">
        <button class="nav-tab active" data-tab="calculator">Calculator</button>
        <button class="nav-tab" data-tab="graphing">Graphing</button>
        <button class="nav-tab" data-tab="converter">Converter</button>
      </nav>
    `;
  }
}
customElements.define('mode-navigation', ModeNavigation);
