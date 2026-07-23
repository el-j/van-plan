import React from 'react';
import { TabType, MetricUnit } from '../../types/van';
import { Box, Compass, Wrench, ShoppingBag, Zap, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unit: MetricUnit;
  setUnit: (unit: MetricUnit) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, unit, setUnit }) => {
  return (
    <header className="app-header">
      <div className="header-branding">
        <div className="logo-icon">🚐</div>
        <div>
          <h1 className="header-title">
            MB T1 Bremer (W602) Camper Planer
            <span className="model-badge">1987 RTW • LHD • 100% Präzisions-CAD</span>
          </h1>
          <p className="header-subtitle">Mercedes-Benz 602 RTW Hochdach • Laderaum 3.050 x 1.720 x 1.850 mm</p>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab ${activeTab === '3d' ? 'active' : ''}`}
          onClick={() => setActiveTab('3d')}
        >
          <Box size={18} />
          <span>3D Gesamtausbau</span>
        </button>

        <button
          className={`nav-tab ${activeTab === '2d' ? 'active' : ''}`}
          onClick={() => setActiveTab('2d')}
        >
          <Compass size={18} />
          <span>2D CAD Blaupause</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'workshop' ? 'active' : ''}`}
          onClick={() => setActiveTab('workshop')}
        >
          <Wrench size={18} />
          <span>Bau- & Bauplan-Guide</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'bom' ? 'active' : ''}`}
          onClick={() => setActiveTab('bom')}
        >
          <ShoppingBag size={18} />
          <span>Stückliste & Shops</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'schematic' ? 'active' : ''}`}
          onClick={() => setActiveTab('schematic')}
        >
          <Zap size={18} />
          <span>Elektrik & Wasser</span>
        </button>
      </nav>

      <div className="header-actions">
        <div className="unit-selector">
          <Layers size={14} />
          <span className="unit-label">Einheit:</span>
          <button
            className={`unit-btn ${unit === 'mm' ? 'active' : ''}`}
            onClick={() => setUnit('mm')}
          >
            mm
          </button>
          <button
            className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
            onClick={() => setUnit('cm')}
          >
            cm
          </button>
          <button
            className={`unit-btn ${unit === 'm' ? 'active' : ''}`}
            onClick={() => setUnit('m')}
          >
            m
          </button>
        </div>
      </div>
    </header>
  );
};
