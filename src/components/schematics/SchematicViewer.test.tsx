import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchematicViewer } from './SchematicViewer';

describe('SchematicViewer component', () => {
  it('renders electrical schematic by default and switches to water schematic and back', () => {
    render(<SchematicViewer />);

    expect(screen.getByText('Victron & LiFePO4 12V/230V System-Schaltplan')).toBeInTheDocument();

    const waterTab = screen.getByText('Frisch- & Abwasser Fließplan');
    fireEvent.click(waterTab);
    expect(screen.getByText('Frischwasser, Warmwasser & Grauwasser Systemplan')).toBeInTheDocument();

    const elecTab = screen.getByText('12V & 230V Elektrik-Schaltplan');
    fireEvent.click(elecTab);
    expect(screen.getByText('Victron & LiFePO4 12V/230V System-Schaltplan')).toBeInTheDocument();
  });
});
