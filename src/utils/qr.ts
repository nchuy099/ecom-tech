export const shipmentQrPayload = (trackingNumber: string) => trackingNumber.trim();

export const generateQrDataUrl = async (value: string) => {
  const { default: QRCode } = await import('qrcode');

  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 8,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  });
};

export const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const decodeQrFile = async (file: File) => {
  const { default: jsQR } = await import('jsqr');
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    return '';
  }

  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const qr = jsQR(imageData.data, imageData.width, imageData.height);

  return qr?.data?.trim() || '';
};
