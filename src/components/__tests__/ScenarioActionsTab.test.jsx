import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import ScenarioActionsTab from '../ScenarioActionsTab/ScenarioActionsTab';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ScenarioActionsTab', () => {
  it('shows the sprint 2 ordering warning when photo upload action exists', () => {
    render(
      <ScenarioActionsTab
        config={{
          actions_catalog: {
            '#photo_upload': { type: 'photo_upload', payload_schema: {} },
          },
        }}
        updateConfig={vi.fn()}
      />
    );

    expect(screen.getByText(/photo upload ordering/i)).toBeInTheDocument();
    expect(screen.getByText(/must come after the lead submission step/i)).toBeInTheDocument();
  });

  it('does not show the ordering warning for non-photo actions', () => {
    render(
      <ScenarioActionsTab
        config={{
          actions_catalog: {
            '#handover': { type: 'handover_to_human', payload_schema: {} },
          },
        }}
        updateConfig={vi.fn()}
      />
    );

    expect(screen.queryByText(/photo upload ordering/i)).not.toBeInTheDocument();
  });
});
