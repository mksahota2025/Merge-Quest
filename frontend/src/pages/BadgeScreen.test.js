/**
 * Note on test framework:
 * These tests are written for React Testing Library with Jest (jsdom).
 * They should also work with Vitest + jsdom if your project uses Vitest.
 * Make sure that @testing-library/jest-dom matchers are registered in your test setup file.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// If your project has a centralized render util, replace the above with that import.
// Import the component under test:
// Prefer a direct relative path if BadgeScreen is colocated (e.g., './BadgeScreen').
// If BadgeScreen lives elsewhere, adjust the import accordingly.
import BadgeScreen from './BadgeScreen';

describe('BadgeScreen', () => {
  const originalOpen = window.open;
  const originalLocation = window.location;

  beforeEach(() => {
    // jsdom provides window.open but we ensure we can assert on it
    window.open = jest.fn();
    // Some code uses window.location; ensure it's defined and not read-only for tests if needed
    delete window.location;
    window.location = { href: 'http://localhost/' };
  });

  afterEach(() => {
    window.open = originalOpen;
    window.location = originalLocation;
    jest.clearAllMocks();
  });

  it('renders the heading, description, image, and share button for a valid sessionId (happy path)', () => {
    const sessionId = 'abc123';
    render(<BadgeScreen sessionId={sessionId} />);

    // Heading
    expect(
      screen.getByRole('heading', { name: /you escaped!/i })
    ).toBeInTheDocument();

    // Description
    expect(
      screen.getByText(/here’s your survival badge:/i)
    ).toBeInTheDocument();

    // Image with correct src and alt
    const img = screen.getByAltText(/badge/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', `http://localhost:5000/badge/${sessionId}`);

    // Share button
    const btn = screen.getByRole('button', { name: /share on linkedin/i });
    expect(btn).toBeInTheDocument();
  });

  it('opens a LinkedIn share URL in a new tab with encoded text when "Share on LinkedIn" is clicked', () => {
    const sessionId = 'xyz789';
    render(<BadgeScreen sessionId={sessionId} />);

    const btn = screen.getByRole('button', { name: /share on linkedin/i });
    fireEvent.click(btn);

    // Validate URL that would be opened
    expect(window.open).toHaveBeenCalledTimes(1);
    const [calledUrl, target] = window.open.mock.calls[0];

    // Base badge and share URL
    const badgeUrl = `http://localhost:5000/badge/${sessionId}`;
    const expectedSummary = encodeURIComponent(
      `We survived Merge Quest! 🧩 Check out our badge:\n${badgeUrl}`
    );
    const expectedShare =
      `https://www.linkedin.com/sharing/share-offsite/?url=${badgeUrl}&summary=${expectedSummary}`;

    expect(calledUrl).toBe(expectedShare);
    expect(target).toBe('_blank');
  });

  it('handles special characters in sessionId by passing them through to the badge URL unchanged', () => {
    // The component constructs the badge URL directly using template literal,
    // without encoding the sessionId. This test documents that behavior.
    const sessionId = 'complex:ID/with?chars=&space%20';
    render(<BadgeScreen sessionId={sessionId} />);

    const img = screen.getByAltText(/badge/i);
    expect(img).toHaveAttribute('src', `http://localhost:5000/badge/${sessionId}`);

    // Clicking share should embed the same raw badge URL and encode only the summary text
    const btn = screen.getByRole('button', { name: /share on linkedin/i });
    fireEvent.click(btn);

    const [calledUrl] = window.open.mock.calls[0];
    const badgeUrl = `http://localhost:5000/badge/${sessionId}`;
    const expectedSummary = encodeURIComponent(
      `We survived Merge Quest! 🧩 Check out our badge:\n${badgeUrl}`
    );
    const expectedShare =
      `https://www.linkedin.com/sharing/share-offsite/?url=${badgeUrl}&summary=${expectedSummary}`;

    expect(calledUrl).toBe(expectedShare);
  });

  it('renders correctly when sessionId is an empty string', () => {
    render(<BadgeScreen sessionId="" />);

    const img = screen.getByAltText(/badge/i);
    // With empty sessionId, badgeUrl ends with trailing slash
    expect(img).toHaveAttribute('src', 'http://localhost:5000/badge/');

    const btn = screen.getByRole('button', { name: /share on linkedin/i });
    fireEvent.click(btn);

    const [calledUrl] = window.open.mock.calls[0];
    const badgeUrl = 'http://localhost:5000/badge/';
    const expectedSummary = encodeURIComponent(
      `We survived Merge Quest! 🧩 Check out our badge:\n${badgeUrl}`
    );
    const expectedShare =
      `https://www.linkedin.com/sharing/share-offsite/?url=${badgeUrl}&summary=${expectedSummary}`;

    expect(calledUrl).toBe(expectedShare);
  });

  it('gracefully handles undefined sessionId by producing a badge URL with "undefined"', () => {
    // This test documents current behavior; consider guarding against undefined inputs in the component if undesired.
    render(<BadgeScreen sessionId={undefined} />);

    const img = screen.getByAltText(/badge/i);
    expect(img).toHaveAttribute('src', 'http://localhost:5000/badge/undefined');

    const btn = screen.getByRole('button', { name: /share on linkedin/i });
    fireEvent.click(btn);

    const [calledUrl] = window.open.mock.calls[0];
    const badgeUrl = 'http://localhost:5000/badge/undefined';
    const expectedSummary = encodeURIComponent(
      `We survived Merge Quest! 🧩 Check out our badge:\n${badgeUrl}`
    );
    const expectedShare =
      `https://www.linkedin.com/sharing/share-offsite/?url=${badgeUrl}&summary=${expectedSummary}`;
    expect(calledUrl).toBe(expectedShare);
  });

  it('uses accessible roles and labels for key UI elements', () => {
    render(<BadgeScreen sessionId="roleCheck123" />);

    // Heading is role=heading; the button is role=button; image has alt text
    expect(
      screen.getByRole('heading', { level: 1, name: /you escaped!/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /share on linkedin/i })
    ).toBeInTheDocument();

    expect(screen.getByAltText(/badge/i)).toBeInTheDocument();
  });
});