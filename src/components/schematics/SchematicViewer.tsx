import React, { useState } from 'react';
import { Zap, Droplets, ShieldCheck, AlertCircle } from 'lucide-react';

export const SchematicViewer: React.FC = () => {
  const [activeSchematic, setActiveSchematic] = useState<'elec' | 'water'>('elec');

  return (
    <div className="schematic-view-container">
      <header className="schematic-header">
        <div className="schematic-tabs">
          <button
            className={`schematic-tab ${activeSchematic === 'elec' ? 'active' : ''}`}
            onClick={() => setActiveSchematic('elec')}
          >
            <Zap size={18} />
            12V & 230V Elektrik-Schaltplan
          </button>
          <button
            className={`schematic-tab ${activeSchematic === 'water' ? 'active' : ''}`}
            onClick={() => setActiveSchematic('water')}
          >
            <Droplets size={18} />
            Frisch- & Abwasser Fließplan
          </button>
        </div>

        <div className="schematic-info-badge">
          <ShieldCheck size={16} />
          <span>VDE 0100-721 Normenkonform für Wohnmobile</span>
        </div>
      </header>

      <main className="schematic-content">
        {activeSchematic === 'elec' ? (
          <div className="schematic-card">
            <h3>Victron & LiFePO4 12V/230V System-Schaltplan</h3>
            <p className="schematic-sub">
              Detaillierte Kabelführung mit Querschnitten (mm²), Absicherungen (Absicherung in A) und Massepunkt-Anbindung am Bremer-Chassis.
            </p>

            <div className="svg-diagram-wrapper">
              <svg viewBox="0 0 900 520" className="schematic-svg">
                {/* Background Grid */}
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Power Sources */}
                {/* Starter Battery */}
                <rect x="50" y="40" width="130" height="80" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                <text x="115" y="75" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Bremer Starter-Batt</text>
                <text x="115" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">12V 88Ah Blei-Säure</text>

                {/* DC-DC Charger */}
                <rect x="240" y="40" width="140" height="80" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                <text x="310" y="75" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Victron Orion-Tr</text>
                <text x="310" y="95" fill="#94a3b8" fontSize="10" textAnchor="middle">12/12-30A Booster</text>

                {/* Main LiFePO4 Battery */}
                <rect x="440" y="40" width="160" height="100" rx="6" fill="#1e293b" stroke="#ff6b00" strokeWidth="2.5" />
                <text x="520" y="80" fill="#ff6b00" fontSize="13" fontWeight="bold" textAnchor="middle">LiFePO4 Bordbatterie</text>
                <text x="520" y="100" fill="#f8fafc" fontSize="11" textAnchor="middle">12.8V 200Ah Smart (BMS)</text>

                {/* MultiPlus Inverter */}
                <rect x="680" y="40" width="170" height="120" rx="6" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
                <text x="765" y="80" fill="#eab308" fontSize="13" fontWeight="bold" textAnchor="middle">Victron MultiPlus</text>
                <text x="765" y="100" fill="#f8fafc" fontSize="11" textAnchor="middle">2000VA / 80A Lader</text>
                <text x="765" y="120" fill="#94a3b8" fontSize="10" textAnchor="middle">Pure Sine 230V AC</text>

                {/* Main Fuse 200A */}
                <rect x="615" y="75" width="45" height="30" rx="4" fill="#ef4444" />
                <text x="637.5" y="95" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">200A</text>

                {/* Cable Lines & Annotations */}
                <path d="M 180 80 L 240 80" stroke="#ef4444" strokeWidth="4" fill="none" />
                <text x="210" y="70" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">16 mm²</text>

                <path d="M 380 80 L 440 80" stroke="#ef4444" strokeWidth="4" fill="none" />
                <text x="410" y="70" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">16 mm²</text>

                <path d="M 600 90 L 615 90" stroke="#ef4444" strokeWidth="6" fill="none" />
                <path d="M 660 90 L 680 90" stroke="#ef4444" strokeWidth="6" fill="none" />
                <text x="637.5" y="62" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">50 mm²</text>

                {/* DC Fuse Block 12V */}
                <rect x="440" y="240" width="160" height="140" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                <text x="520" y="270" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">12V Sicherungsverteiler</text>
                <text x="520" y="290" fill="#94a3b8" fontSize="10" textAnchor="middle">6-fach ATO Sicherungen</text>

                {/* Consumer Loads */}
                <path d="M 520 140 L 520 240" stroke="#ef4444" strokeWidth="4" fill="none" />
                <text x="535" y="190" fill="#ef4444" fontSize="10" fontWeight="bold">10 mm²</text>

                <g transform="translate(680, 240)">
                  <rect width="170" height="35" rx="4" fill="#0f172a" stroke="#22c55e" />
                  <text x="15" y="22" fill="#f8fafc" fontSize="11">1. Wasserpumpe (10A)</text>

                  <rect y="45" width="170" height="35" rx="4" fill="#0f172a" stroke="#22c55e" />
                  <text x="15" y="67" fill="#f8fafc" fontSize="11">2. Kühlbox Kompressor (15A)</text>

                  <rect y="90" width="170" height="35" rx="4" fill="#0f172a" stroke="#22c55e" />
                  <text x="15" y="112" fill="#f8fafc" fontSize="11">3. Hubbett 12V Motor (30A)</text>

                  <rect y="135" width="170" height="35" rx="4" fill="#0f172a" stroke="#22c55e" />
                  <text x="15" y="157" fill="#f8fafc" fontSize="11">4. LED Dimmer & USB (10A)</text>
                </g>

                <path d="M 600 257 L 680 257" stroke="#22c55e" strokeWidth="2" />
                <path d="M 600 302 L 680 302" stroke="#22c55e" strokeWidth="2" />
                <path d="M 600 347 L 680 347" stroke="#22c55e" strokeWidth="2" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="schematic-card">
            <h3>Frischwasser, Warmwasser & Grauwasser Systemplan</h3>
            <p className="schematic-sub">
              Druckwasser-Installation mit Shurflo 7L Pumpe, Elgena 10L Warmwasserboiler & Trenntoiletten-Ableitung.
            </p>

            <div className="svg-diagram-wrapper">
              <svg viewBox="0 0 900 480" className="schematic-svg">
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* 80L Fresh Tank */}
                <rect x="60" y="80" width="180" height="120" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
                <text x="150" y="130" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">80L Frischwassertank</text>
                <text x="150" y="150" fill="#94a3b8" fontSize="11" textAnchor="middle">Einbau Radkasten Rechts</text>

                {/* Shurflo Pump */}
                <rect x="300" y="100" width="120" height="80" rx="6" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                <text x="360" y="135" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">Shurflo 7L/min</text>
                <text x="360" y="155" fill="#94a3b8" fontSize="10" textAnchor="middle">Druckwasserpumpe</text>

                {/* Boiler */}
                <rect x="480" y="60" width="130" height="80" rx="6" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                <text x="545" y="95" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">Elgena 10L Boiler</text>
                <text x="545" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle">12V / 230V Warmwasser</text>

                {/* Outdoor Kitchen Sink */}
                <rect x="670" y="100" width="160" height="100" rx="6" fill="#1e293b" stroke="#ff6b00" strokeWidth="2" />
                <text x="750" y="140" fill="#ff6b00" fontSize="13" fontWeight="bold" textAnchor="middle">Outdoor-Küche</text>
                <text x="750" y="160" fill="#f8fafc" fontSize="11" textAnchor="middle">Dometic HSG Spüle</text>

                {/* 19L Greywater Tank */}
                <rect x="670" y="270" width="160" height="90" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                <text x="750" y="310" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">19L Grauwasser</text>
                <text x="750" y="330" fill="#64748b" fontSize="10" textAnchor="middle">Kanister Unter Spüle</text>

                {/* Pipes */}
                <path d="M 240 140 L 300 140" stroke="#38bdf8" strokeWidth="4" fill="none" />
                <path d="M 420 140 L 450 140 L 450 100 L 480 100" stroke="#38bdf8" strokeWidth="4" fill="none" />
                <path d="M 450 140 L 670 140" stroke="#38bdf8" strokeWidth="4" fill="none" />
                <path d="M 610 100 L 650 100 L 650 125 L 670 125" stroke="#ef4444" strokeWidth="4" fill="none" />
                <path d="M 750 200 L 750 270" stroke="#64748b" strokeWidth="4" fill="none" />
              </svg>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
