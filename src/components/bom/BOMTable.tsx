import React, { useState, useMemo } from 'react';
import { MASTER_BOM_ITEMS } from '../../data/bomData';
import { ModuleCategory } from '../../types/van';
import { formatCurrency, formatWeight } from '../../utils/formatters';
import { Search, ExternalLink, Download, ShoppingBag, Filter, Scale } from 'lucide-react';

export const BOMTable: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(MASTER_BOM_ITEMS.map((item) => item.category)));
    return ['ALL', ...cats];
  }, []);

  const filteredItems = useMemo(() => {
    return MASTER_BOM_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const totalCost = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + item.totalPriceEuro, 0);
  }, [filteredItems]);

  const totalWeight = useMemo(() => {
    return filteredItems.reduce((acc, item) => acc + item.totalWeightKg, 0);
  }, [filteredItems]);

  const exportCSV = () => {
    const headers = ['Kategorie', 'Name', 'Spezifikation', 'Abmessung_mm', 'Anzahl', 'Einheit', 'Stueckpreis_EUR', 'Gesamtpreis_EUR', 'Gewicht_kg', 'Haendler', 'Teilenummer'];
    const rows = filteredItems.map((i) => [
      `"${i.category}"`,
      `"${i.name}"`,
      `"${i.specification}"`,
      `"${i.dimensionsMm || ''}"`,
      i.quantity,
      `"${i.unit}"`,
      i.unitPriceEuro,
      i.totalPriceEuro,
      i.totalWeightKg,
      `"${i.supplier}"`,
      `"${i.partNumber}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'MB_T1_Bremer_Stueckliste_BOM.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bom-view-container">
      <header className="bom-header">
        <div className="bom-title-group">
          <h2>
            <ShoppingBag size={22} className="icon-orange" />
            Master-Stückliste & Einkaufsratgeber (Bill of Materials)
          </h2>
          <p>Alle benötigten Originalbauteile mit aktuellen Preisen, Gewichten und Fachhändler-Links.</p>
        </div>

        <div className="bom-summary-pills">
          <div className="summary-pill cost">
            <span className="label">Gesamtsumme ({filteredItems.length} Positionen)</span>
            <span className="val">{formatCurrency(totalCost)}</span>
          </div>

          <div className="summary-pill weight">
            <Scale size={16} />
            <span className="label">Gesamtgewicht</span>
            <span className="val">{formatWeight(totalWeight)}</span>
          </div>

          <button className="export-btn" onClick={exportCSV}>
            <Download size={16} />
            <span>CSV Stückliste Exportieren</span>
          </button>
        </div>
      </header>

      <div className="bom-filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Bauteil, Teilenummer oder Händler suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-scroll">
          <Filter size={14} className="filter-icon" />
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'Alle Kategorien' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bom-table-wrapper">
        <table className="bom-table">
          <thead>
            <tr>
              <th>Kategorie</th>
              <th>Bauteil Name & Spezifikation</th>
              <th>Abmessung (mm)</th>
              <th>Menge</th>
              <th>Stückpreis</th>
              <th>Gesamtpreis</th>
              <th>Gewicht</th>
              <th>Fachhändler & Teilenr</th>
              <th>Shop Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="cat-badge">{item.category}</span>
                </td>
                <td>
                  <div className="item-name">{item.name}</div>
                  <div className="item-spec">{item.specification}</div>
                </td>
                <td className="font-mono text-xs">{item.dimensionsMm || '-'}</td>
                <td className="font-bold text-center">
                  {item.quantity} {item.unit}
                </td>
                <td className="font-mono">{formatCurrency(item.unitPriceEuro)}</td>
                <td className="font-mono font-bold accent">{formatCurrency(item.totalPriceEuro)}</td>
                <td className="font-mono">{formatWeight(item.totalWeightKg)}</td>
                <td>
                  <div className="supplier-title">{item.supplier}</div>
                  <div className="part-number">TN: {item.partNumber}</div>
                </td>
                <td>
                  <a href={item.shopUrl} target="_blank" rel="noopener noreferrer" className="buy-btn">
                    <span>Shop</span>
                    <ExternalLink size={12} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
