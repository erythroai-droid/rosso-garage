export default function Footer() {
  return (
    <footer className="ftr" id="contact">
      <div className="ftr-grid">
        <div>
          <div className="logo">rosso<br />garage</div>
          <p className="muted">A private showcase of sports cars. Every lot is inspected and photographed by our own team before it is listed.</p>
        </div>
        <div>
          <h4>Lot 0001</h4>
          <p>Rosso Spider · Matte Rosso</p>
          <p>Carbon / yellow accents</p>
          <a className="btn" href="mailto:hello@example.com">Contact Seller →</a>
        </div>
        <div>
          <h4>Garage</h4>
          <a href="#top">Collection</a><a href="#top">Sell with us</a><a href="#top">Concierge</a><a href="#top">Journal</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:hello@example.com">hello@example.com</a>
          <p className="muted">+00 000 000 00 00</p>
        </div>
      </div>
      <div className="ftr-bot"><span>© 2026 rosso garage</span><span>Demo layout: all texts and figures are placeholders.</span></div>
    </footer>
  );
}
