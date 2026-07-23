import React, { useState } from 'react';
import { INTERIOR_MODULES } from '../../data/modulesData';
import { MetricUnit } from '../../types/van';
import { formatDimension, formatCurrency, formatWeight } from '../../utils/formatters';
import { Wrench, ShieldAlert, CheckCircle2, Scissors, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface WorkshopGuideProps {
  unit: MetricUnit;
}

export const WorkshopGuide: React.FC<WorkshopGuideProps> = ({ unit }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(INTERIOR_MODULES[0].id);

  const activeModule = INTERIOR_MODULES.find((m) => m.id === selectedModuleId) || INTERIOR_MODULES[0];

  return (
    <div className="workshop-guide-view">
      <aside className="workshop-sidebar">
        <h3 className="sidebar-title">Baugruppen & Module</h3>
        <div className="module-list">
          {INTERIOR_MODULES.map((m) => (
            <button
              key={m.id}
              className={`module-tab-btn ${m.id === activeModule.id ? 'active' : ''}`}
              onClick={() => setSelectedModuleId(m.id)}
            >
              <div className="module-name">{m.name}</div>
              <div className="module-meta">
                <span>{formatDimension(m.dimensionsMm.length, unit)} x {formatDimension(m.dimensionsMm.width, unit)}</span>
                <span className="module-price">{formatCurrency(m.totalCostEuro)}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="workshop-content">
        <header className="module-header-card">
          <div>
            <span className="category-badge">{activeModule.category}</span>
            <h2>{activeModule.name}</h2>
            <p className="description">{activeModule.fullDescription}</p>
          </div>

          <div className="module-quick-metrics">
            <div className="metric">
              <span className="label">Abmessungen (L x B x H)</span>
              <span className="value">
                {formatDimension(activeModule.dimensionsMm.length, unit)} x{' '}
                {formatDimension(activeModule.dimensionsMm.width, unit)} x{' '}
                {formatDimension(activeModule.dimensionsMm.height, unit)}
              </span>
            </div>
            <div className="metric">
              <span className="label">Modul-Gewicht</span>
              <span className="value">{formatWeight(activeModule.weightKg)}</span>
            </div>
            <div className="metric">
              <span className="label">Materialkosten</span>
              <span className="value accent">{formatCurrency(activeModule.totalCostEuro)}</span>
            </div>
          </div>
        </header>

        {/* Highlights */}
        <section className="section-card">
          <h3>
            <CheckCircle2 size={18} className="icon-green" />
            Konstruktions-Highlights & Features
          </h3>
          <ul className="highlights-grid">
            {activeModule.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </section>

        {/* Cut List */}
        <section className="section-card">
          <h3>
            <Scissors size={18} className="icon-orange" />
            Präzisions-Zuschnittliste (Zuschnitt in mm)
          </h3>
          <div className="table-wrapper">
            <table className="cutlist-table">
              <thead>
                <tr>
                  <th>Bauteil Name</th>
                  <th>Material</th>
                  <th>Länge ({unit})</th>
                  <th>Breite ({unit})</th>
                  <th>Dicke ({unit})</th>
                  <th>Anzahl</th>
                  <th>Winkel (L / R)</th>
                  <th>Hinweise & Verbindung</th>
                </tr>
              </thead>
              <tbody>
                {activeModule.cutList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.name}</td>
                    <td>{item.material}</td>
                    <td className="font-mono">{formatDimension(item.lengthMm, unit)}</td>
                    <td className="font-mono">{formatDimension(item.widthMm, unit)}</td>
                    <td className="font-mono">{formatDimension(item.thicknessMm, unit)}</td>
                    <td className="text-center font-bold">{item.quantity}x</td>
                    <td className="font-mono text-center">{item.angleLeft}° / {item.angleRight}°</td>
                    <td className="text-muted">{item.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Step-by-Step Assembly Instructions */}
        <section className="section-card">
          <h3>
            <Wrench size={18} className="icon-blue" />
            Schritt-für-Schritt Bauanleitung & Werkzeugliste
          </h3>
          <div className="assembly-steps-container">
            {activeModule.assemblySteps.map((step) => (
              <div key={step.stepNumber} className="step-card">
                <div className="step-badge">{step.stepNumber}</div>
                <div className="step-body">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>

                  <div className="step-tools-grid">
                    <div className="tools-box">
                      <span className="box-label">Erforderliche Werkzeuge:</span>
                      <div className="tags">
                        {step.toolsNeeded.map((t, idx) => (
                          <span key={idx} className="tag tool-tag">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="fasteners-box">
                      <span className="box-label">Verbindungsmittel & Schrauben:</span>
                      <div className="tags">
                        {step.fastenersNeeded.map((f, idx) => (
                          <span key={idx} className="tag fastener-tag">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resellers */}
        <section className="section-card">
          <h3>
            <FileSpreadsheet size={18} className="icon-purple" />
            Materialbezugsquellen & Fachhändler
          </h3>
          <div className="reseller-grid">
            {activeModule.resellerLinks.map((r, idx) => (
              <div key={idx} className="reseller-card">
                <div className="reseller-header">
                  <span className="supplier-name">{r.supplier}</span>
                  <span className="reseller-price">{formatCurrency(r.unitPrice)}</span>
                </div>
                <div className="part-name">{r.partName}</div>
                <div className="part-num">Teilenr: {r.partNumber}</div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="shop-link">
                  <span>Zum Händler-Shop</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
