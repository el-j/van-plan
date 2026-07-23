import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkshopGuide } from './WorkshopGuide';
import { INTERIOR_MODULES } from '../../data/modulesData';

describe('WorkshopGuide component', () => {
  it('renders module list, active module cut list, assembly steps, and resellers', () => {
    render(<WorkshopGuide unit="mm" />);

    expect(screen.getByText('Baugruppen & Module')).toBeInTheDocument();
    expect(screen.getAllByText(INTERIOR_MODULES[0].name)[0]).toBeInTheDocument();

    // Click second module (Bed)
    fireEvent.click(screen.getAllByText(INTERIOR_MODULES[1].name)[0]);
    expect(screen.getAllByText(INTERIOR_MODULES[1].name)[0]).toBeInTheDocument();
    expect(screen.getByText('Präzisions-Zuschnittliste (Zuschnitt in mm)')).toBeInTheDocument();
  });
});
