import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BOMTable } from './BOMTable';

describe('BOMTable component', () => {
  it('renders BOM items, filters by search query and category, and exports CSV', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<BOMTable />);

    expect(screen.getByPlaceholderText('Bauteil, Teilenummer oder Händler suchen...')).toBeInTheDocument();

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Bauteil, Teilenummer oder Händler suchen...');
    fireEvent.change(searchInput, { target: { value: 'Armaflex' } });

    expect(screen.getByText('Armaflex XG 19mm Selbstklebend')).toBeInTheDocument();

    // Test category filter click (select the filter button)
    const categoryBtn = screen.getAllByText('Chassis & Subfloor')[0];
    fireEvent.click(categoryBtn);

    // Test export button
    const exportBtn = screen.getByText('CSV Stückliste Exportieren');
    fireEvent.click(exportBtn);

    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });
});
