import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App root component', () => {
  it('renders app header, stats bar, and switches views', () => {
    render(<App />);

    expect(screen.getByText('3D Gesamtausbau')).toBeInTheDocument();

    // Switch to 2D tab
    fireEvent.click(screen.getByText('2D CAD Blaupause'));
    expect(screen.getByText('Draufsicht (Grundriss mm)')).toBeInTheDocument();

    // Switch to Workshop tab
    fireEvent.click(screen.getByText('Bau- & Bauplan-Guide'));
    expect(screen.getByText('Baugruppen & Module')).toBeInTheDocument();

    // Switch to BOM tab
    fireEvent.click(screen.getByText('Stückliste & Shops'));
    expect(screen.getByPlaceholderText('Bauteil, Teilenummer oder Händler suchen...')).toBeInTheDocument();

    // Switch to Schematics tab
    fireEvent.click(screen.getByText('Elektrik & Wasser'));
    expect(screen.getByText('Victron & LiFePO4 12V/230V System-Schaltplan')).toBeInTheDocument();
  });
});
