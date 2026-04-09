import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StepRenderer from '../StepRenderer';

const baseStep = {
  type: 'photo_upload',
  config: {
    max_files: 5,
    max_size_mb: 10,
    accepted_types: ['image/jpeg', 'image/png', 'image/heic'],
    photo_types: ['face_front', 'body'],
    required: true,
    prompt: 'Please upload photos for your consultation.',
    consent_text: 'I consent to sharing these photos with the medical team.',
  },
};

const renderPhotoUpload = (overrideStep = {}, onSubmit = vi.fn()) => {
  render(<StepRenderer step={{ ...baseStep, ...overrideStep }} onSubmit={onSubmit} />);
  return { onSubmit };
};

const getFileInput = () => document.querySelector('input[type="file"]');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('StepRenderer photo_upload', () => {
  it('keeps upload disabled until consent is checked and at least one photo is selected', async () => {
    renderPhotoUpload();
    const uploadButton = screen.getByRole('button', { name: /upload & continue/i });
    expect(uploadButton).toBeDisabled();

    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });
    fireEvent.change(getFileInput(), { target: { files: [file] } });

    expect(uploadButton).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox'));
    expect(uploadButton).toBeEnabled();
  });

  it('submits uploaded files with the selected photo type and consent flag', async () => {
    const { onSubmit } = renderPhotoUpload();
    const file = new File(['image'], 'front.jpg', { type: 'image/jpeg' });

    fireEvent.change(getFileInput(), { target: { files: [file] } });

    const combo = screen.getByRole('combobox');
    await userEvent.selectOptions(combo, 'body');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /upload & continue/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      type: 'photo_upload',
      value: {
        photos: [{ file, type: 'body' }],
        consent_given: true,
      },
    });
  });

  it('rejects files above the configured size limit', () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {});
    renderPhotoUpload({
      config: {
        ...baseStep.config,
        max_size_mb: 1,
      },
    });

    const oversizedFile = new File(['large'], 'too-big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(oversizedFile, 'size', { value: 2 * 1024 * 1024 });

    fireEvent.change(getFileInput(), { target: { files: [oversizedFile] } });

    expect(alertSpy).toHaveBeenCalledWith('File too large (max 1MB): too-big.jpg');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows skip action and submits skipped payload when the step is optional', async () => {
    const { onSubmit } = renderPhotoUpload({
      config: {
        ...baseStep.config,
        required: false,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: /skip/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      type: 'photo_upload',
      value: { photos: [], skipped: true },
    });
  });

  it('stops at five files even if the browser selection contains more', () => {
    renderPhotoUpload();

    const files = Array.from({ length: 6 }, (_, index) => (
      new File([`image-${index}`], `photo-${index + 1}.jpg`, { type: 'image/jpeg' })
    ));

    fireEvent.change(getFileInput(), { target: { files } });

    expect(screen.getAllByRole('combobox')).toHaveLength(5);
    expect(screen.queryByText(/add photo/i)).not.toBeInTheDocument();
  });
});
