import React from 'react';
import { INTERIOR_MODULES } from '../../data/modulesData';
import { MASTER_BOM_ITEMS } from '../../data/bomData';
import { formatCurrency, formatWeight, formatDimension } from '../../utils/formatters';
import { MetricUnit } from '../../types/van';
import { ShieldCheck, Scale, Euro, Footprints, ArrowUpDown } from 'lucide-react';

interface QuickStatsBarProps {
  unit: MetricUnit;
  isBedLowered: boolean;
  isKitchenExtended: boolean;
}

export const QuickStatsBar: React.FC<QuickStatsBarProps> = ({ unit, isBedLowered, isKitchenExtended }) => {
  const totalModuleWeight = INTERIOR_MODULES.reduce((acc, m) => acc + m.weightKg, 0);
  const totalBomCost = MASTER_BOM_ITEMS.reduce((acc, b) => acc + b.totalPriceEuro, 0);

  const maxPayload = 1220; // kg max allowed payload for T1 3500kg ZGG
  const weightPercentage = Math.min(100, Math.round((totalModuleWeight / maxPayload) * 100));

  return (
    <div className="quick-stats-bar">
      <div className="stat-card">
        <div className="stat-icon weight">
          <Scale size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Gesamtgewicht Ausbau</span>
          <div className="stat-value-group">
            <span className="stat-value">{formatWeight(totalModuleWeight)}</span>
            <span className="stat-subtext">/ {maxPayload} kg Max Nutzlast</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${weightPercentage > 85 ? 'warning' : ''}`}
              style={{ width: `${weightPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon cost">
          <Euro size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Geschätzte Materialkosten</span>
          <span className="stat-value accent">{formatCurrency(totalBomCost)}</span>
          <span className="stat-subtext">Inkl. Dämmung, Holz, Winde & Elektrik</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon gangway">
          <Footprints size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Freie Gehbreite (Mittelgang)</span>
          <span className="stat-value success">{formatDimension(600, unit)}</span>
          <span className="stat-subtext">Trennwand-Tür: {formatDimension(650, unit)}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon bed">
          <ArrowUpDown size={18} />
        </div>
        <div className="stat-info">
          <span className="stat-label">Hubbett-Status (1850x1400)</span>
          <span className={`stat-value ${isBedLowered ? 'active-night' : 'active-day'}`}>
            {isBedLowered ? 'Nacht (Abgesenkt 550mm)' : 'Tag (Unter Decke 1650mm)'}
          </span>
          <span className="stat-subtext">Küche: {isKitchenExtended ? 'Draußen (-250mm)' : 'Eingefahren'}</span>
        </div>
      </div>

      <div className="stat-card badge-card">
        <ShieldCheck size={20} className="shield-icon" />
        <div className="stat-info">
          <span className="badge-title">TÜV / WoMo-Zulassung</span>
          <span className="badge-desc">Feste Stehhöhe & Gaskasten nach DVGW G607</span>
        </div>
      </div>
    </div>
  );
};
