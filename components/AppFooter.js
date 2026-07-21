class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="app-footer">
        <p>&copy; 2026 AURA. Powered by HTML5 Canvas &amp; ES6 Javascript.</p>
      </footer>
    `;
  }
}
customElements.define('app-footer', AppFooter);
