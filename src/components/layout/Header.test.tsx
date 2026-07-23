import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header component', () => {
  it('renders title, handles all navigation tab clicks, and unit switches', () => {
    const setActiveTab = vi.fn();
    const setUnit = vi.fn();

    render(
      <Header
        activeTab="3d"
        setActiveTab={setActiveTab}
        unit="mm"
        setUnit={setUnit}
      />
    );

    expect(screen.getByText(/MB T1 Bremer \(W602\) Camper Planer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('3D Gesamtausbau'));
    expect(setActiveTab).toHaveBeenCalledWith('3d');

    fireEvent.click(screen.getByText('2D CAD Blaupause'));
    expect(setActiveTab).toHaveBeenCalledWith('2d');

    fireEvent.click(screen.getByText('Bau- & Bauplan-Guide'));
    expect(setActiveTab).toHaveBeenCalledWith('workshop');

    fireEvent.click(screen.getByText('Stückliste & Shops'));
    expect(setActiveTab).toHaveBeenCalledWith('bom');

    fireEvent.click(screen.getByText('Elektrik & Wasser'));
    expect(setActiveTab).toHaveBeenCalledWith('schematic');

    fireEvent.click(screen.getByText('mm'));
    expect(setUnit).toHaveBeenCalledWith('mm');

    fireEvent.click(screen.getByText('cm'));
    expect(setUnit).toHaveBeenCalledWith('cm');

    fireEvent.click(screen.getByText('m'));
    expect(setUnit).toHaveBeenCalledWith('m');
  });
});
