import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickStatsBar } from './QuickStatsBar';

describe('QuickStatsBar component', () => {
  it('renders stats for weight, cost, gangway clearance, and bed status', () => {
    render(
      <QuickStatsBar
        unit="mm"
        isBedLowered={false}
        isKitchenExtended={false}
      />
    );

    expect(screen.getByText('Gesamtgewicht Ausbau')).toBeInTheDocument();
    expect(screen.getByText('Geschätzte Materialkosten')).toBeInTheDocument();
    expect(screen.getByText('600 mm')).toBeInTheDocument();
    expect(screen.getByText('Tag (Unter Decke 1650mm)')).toBeInTheDocument();
  });

  it('renders night status when bed is lowered', () => {
    render(
      <QuickStatsBar
        unit="mm"
        isBedLowered={true}
        isKitchenExtended={true}
      />
    );

    expect(screen.getByText('Nacht (Abgesenkt 550mm)')).toBeInTheDocument();
  });
});
