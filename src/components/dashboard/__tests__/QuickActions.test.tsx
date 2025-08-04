import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickActions from '../QuickActions';
import { QuickAction } from '../../../types/dashboard';

describe('QuickActions', () => {
  const mockActions: QuickAction[] = [
    {
      id: 'start-session',
      label: 'Start Session',
      icon: 'message-square',
      action: vi.fn(),
      disabled: false,
      tooltip: 'Start a new practice session'
    },
    {
      id: 'upload-deck',
      label: 'Upload Deck',
      icon: 'upload',
      action: vi.fn(),
      disabled: false,
      tooltip: 'Upload a new pitch deck'
    },
    {
      id: 'disabled-action',
      label: 'Disabled Action',
      icon: 'alert-circle',
      action: vi.fn(),
      disabled: true,
      tooltip: 'This action is disabled'
    }
  ];

  it('renders quick actions correctly', () => {
    render(<QuickActions actions={mockActions} />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Start Session')).toBeInTheDocument();
    expect(screen.getByText('Upload Deck')).toBeInTheDocument();
    expect(screen.getByText('Disabled Action')).toBeInTheDocument();
  });

  it('shows "Get Started" title for first-time users', () => {
    render(<QuickActions actions={mockActions} isFirstTime={true} />);
    
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('calls action when button is clicked', () => {
    render(<QuickActions actions={mockActions} />);
    
    const startSessionButton = screen.getByText('Start Session').closest('button');
    fireEvent.click(startSessionButton!);
    
    expect(mockActions[0].action).toHaveBeenCalled();
  });

  it('disables buttons when action is disabled', () => {
    render(<QuickActions actions={mockActions} />);
    
    const disabledButton = screen.getByText('Disabled Action').closest('button');
    expect(disabledButton).toBeDisabled();
  });

  it('renders nothing when no actions provided', () => {
    const { container } = render(<QuickActions actions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows first-time user guidance message', () => {
    render(<QuickActions actions={mockActions} isFirstTime={true} />);
    
    expect(screen.getByText('Complete your first practice session to unlock more features')).toBeInTheDocument();
  });
});