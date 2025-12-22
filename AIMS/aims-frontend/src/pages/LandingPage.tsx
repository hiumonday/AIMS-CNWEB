import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => (
  <main className="landing__hero">
    <div className="landing__card">
      <div className="landing__eyebrow">New Season • Essentials</div>
      <h1>AIMS Atelier</h1>
      <p>Selected books, music &amp; media curated for slow living. Minimal, considered, timeless.</p>
      <div className="landing__actions">
        <Link className="btn primary" to="/products">
          Shop Collection
        </Link>
        <Link className="btn light" to="/contact">
          Visit Studio
        </Link>
      </div>
    </div>
  </main>
);

export default LandingPage;
