using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Text.RegularExpressions;
using ZXing;
using ZXing.Common;
using ZXing.QrCode;
using ZXing.Windows.Compatibility;

namespace Application.Services
{
    public class BarcodeService
    {
        private readonly Random _random = new Random();

        /// <summary>
        /// Generates a unique barcode for purchase order receiving history
        /// </summary>
        /// <param name="purchaseOrderId">Purchase Order ID</param>
        /// <param name="productId">Product ID</param>
        /// <param name="batchNumber">Batch Number</param>
        /// <returns>Unique barcode string</returns>
        public string GenerateUniqueBarcode(Guid purchaseOrderId, Guid productId, string batchNumber)
        {
            // Use 3 chars from each GUID
            var poShort = purchaseOrderId.ToString("N").Substring(0, 3);
            var productShort = productId.ToString("N").Substring(0, 3);
            // Use a 2-char hash of the batch number
            var batchHash = (batchNumber == null) ? "00" : Math.Abs(batchNumber.GetHashCode()).ToString("X2").Substring(0, 2);
            // Use a 3-digit random or timestamp-based suffix
            var randomSuffix = _random.Next(100, 999).ToString();
            // Format: Pxxx-Pxxx-Bxx-xxx
            return $"P{poShort}-P{productShort}-B{batchHash}-{randomSuffix}";
        }

        /// <summary>
        /// Generates a barcode image as byte array
        /// </summary>
        /// <param name="barcodeText">Text to encode in barcode</param>
        /// <param name="width">Image width</param>
        /// <param name="height">Image height</param>
        /// <returns>Byte array of the barcode image</returns>
        public byte[] GenerateBarcodeImage(string barcodeText, int width = 300, int height = 100)
        {
            if (string.IsNullOrWhiteSpace(barcodeText))
                throw new ArgumentException("Barcode text cannot be null or empty");

            // Optional sanitization
            var sanitizedText = barcodeText.Trim();

            if (string.IsNullOrWhiteSpace(sanitizedText))
                throw new ArgumentException("Barcode text contains no valid characters");

            try
            {
                width = Math.Max(100, Math.Min(width, 2000));
                height = Math.Max(50, Math.Min(height, 1000));

                var writer = new BarcodeWriter<Bitmap>
                {
                    Format = BarcodeFormat.CODE_128,
                    Options = new EncodingOptions
                    {
                        Height = height,
                        Width = width,
                        Margin = 10,
                        PureBarcode = false
                    },
                    Renderer = new BitmapRenderer() // ?? This is the fix
                };

                using (var bitmap = writer.Write(sanitizedText))
                using (var stream = new MemoryStream())
                {
                    bitmap.Save(stream, ImageFormat.Png);
                    return stream.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to generate barcode image: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Generates a QR code image as byte array
        /// </summary>
        /// <param name="qrText">Text to encode in QR code</param>
        /// <param name="width">Image width</param>
        /// <param name="height">Image height</param>
        /// <returns>Byte array of the QR code image</returns>
        public byte[] GenerateQrCodeImage(string qrText, int width = 300, int height = 300)
        {
            if (string.IsNullOrWhiteSpace(qrText))
                throw new ArgumentException("QR code text cannot be null or empty");

            // Optional: sanitize input
            var sanitizedText = qrText.Trim();

            if (string.IsNullOrWhiteSpace(sanitizedText))
                throw new ArgumentException("QR code text contains no valid characters");

            try
            {
                // Validate size bounds
                width = Math.Max(100, Math.Min(width, 2000));
                height = Math.Max(100, Math.Min(height, 2000));

                var writer = new BarcodeWriter<Bitmap>
                {
                    Format = BarcodeFormat.QR_CODE,
                    Options = new QrCodeEncodingOptions
                    {
                        Height = height,
                        Width = width,
                        Margin = 1,
                        CharacterSet = "UTF-8"
                    },
                    Renderer = new BitmapRenderer() // ?? Required renderer to avoid the error
                };

                using (var bitmap = writer.Write(sanitizedText))
                using (var stream = new MemoryStream())
                {
                    bitmap.Save(stream, ImageFormat.Png);
                    return stream.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to generate QR code image: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Validates if a barcode format is correct (more flexible validation)
        /// </summary>
        /// <param name="barcode">Barcode to validate</param>
        /// <returns>True if valid format</returns>
        public bool IsValidBarcodeFormat(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return false;

            // Remove any trailing colons or invalid characters
            barcode = barcode.TrimEnd(':').Trim();

            // Check if it follows our format: PO{8chars}-P{8chars}-B{8chars}-{timestamp}-{4digits}
            var parts = barcode.Split('-');
            if (parts.Length != 5)
                return false;

            // Validate PO part (should start with PO and be 10 characters total)
            if (!parts[0].StartsWith("PO") || parts[0].Length != 10)
                return false;

            // Validate Product part (should start with P and be 9 characters total)
            if (!parts[1].StartsWith("P") || parts[1].Length != 9)
                return false;

            // Validate Batch part (should start with B and be 9 characters total)
            if (!parts[2].StartsWith("B") || parts[2].Length != 9)
                return false;

            // Validate timestamp (should be a valid long number)
            if (!long.TryParse(parts[3], out _))
                return false;

            // Validate random suffix (should be a valid integer)
            if (!int.TryParse(parts[4], out _))
                return false;

            return true;
        }

/*        /// <summary>
        /// Sanitizes barcode text for CODE_128 encoding
        /// </summary>
        /// <param name="text">Text to sanitize</param>
        /// <returns>Sanitized text</returns>
        private string SanitizeBarcodeText(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            // Remove any trailing colons or invalid characters
            text = text.TrimEnd(':').Trim();

            // CODE_128 supports ASCII characters 32-127 (printable characters)
            var sanitized = new System.Text.StringBuilder();
            foreach (char c in text)
            {
                if (c >= 32 && c <= 127)
                {
                    sanitized.Append(c);
                }
            }

            return sanitized.ToString();
        }

        /// <summary>
        /// Sanitizes QR code text
        /// </summary>
        /// <param name="text">Text to sanitize</param>
        /// <returns>Sanitized text</returns>
        private string SanitizeQrText(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            // Remove any trailing colons or invalid characters
            text = text.TrimEnd(':').Trim();

            // QR codes can handle most characters, but let's remove control characters
            var sanitized = new System.Text.StringBuilder();
            foreach (char c in text)
            {
                if (!char.IsControl(c) || c == '\n' || c == '\r' || c == '\t')
                {
                    sanitized.Append(c);
                }
            }

            return sanitized.ToString();
        }*/
    }
} 