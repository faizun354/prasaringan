import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeViewProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 160,
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#1c1b1f',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setDataUrl(url))
      .catch((err) => {
        console.error('Error generating QR Code:', err);
      });
  }, [value, size]);

  if (!value) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-surface-container flex items-center justify-center rounded-lg text-outline text-xs ${className}`}
      >
        <span>Token Kosong</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-surface-container-high flex items-center justify-center rounded-lg ${className}`}
      >
        <span className="material-symbols-outlined text-outline text-[24px] animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code ${value}`}
      style={{ width: size, height: size }}
      className={`object-contain block rounded-lg ${className}`}
    />
  );
};

/**
 * Generate base64 Data URL PNG dari QR Code untuk kebutuhan download / print
 */
export async function generateQRCodeDataUrl(value: string, size = 320): Promise<string> {
  return QRCode.toDataURL(value, {
    width: size,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'H'
  });
}
