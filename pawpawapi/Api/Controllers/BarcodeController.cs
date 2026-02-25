using Application.DTOs;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BarcodeController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;
        private readonly BarcodeService _barcodeService;
        private readonly ILogger<BarcodeController> _logger;

        public BarcodeController(
            IPurchaseOrderService purchaseOrderService,
            BarcodeService barcodeService,
            ILogger<BarcodeController> logger)
        {
            _purchaseOrderService = purchaseOrderService;
            _barcodeService = barcodeService;
            _logger = logger;
        }

        /// <summary>
        /// Test endpoint to generate a sample barcode for testing
        /// </summary>
        /// <returns>Sample barcode data</returns>
        [HttpGet("test")]
        public ActionResult TestBarcode()
        {
            try
            {
                // Generate a sample barcode using the service
                var sampleBarcode = _barcodeService.GenerateUniqueBarcode(
                    Guid.NewGuid(), 
                    Guid.NewGuid(), 
                    "TESTBATCH"
                );

                // Try to generate images
                var barcodeImage = _barcodeService.GenerateBarcodeImage(sampleBarcode, 300, 100);
                var qrCodeImage = _barcodeService.GenerateQrCodeImage(sampleBarcode, 300, 300);

                return Ok(new
                {
                    message = "Barcode service is working correctly",
                    sampleBarcode = sampleBarcode,
                    barcodeImageSize = barcodeImage.Length,
                    qrCodeImageSize = qrCodeImage.Length,
                    isValidFormat = _barcodeService.IsValidBarcodeFormat(sampleBarcode)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test barcode endpoint");
                return StatusCode(500, new
                {
                    message = "Barcode service test failed",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Scan a barcode and get all details for the specific batch
        /// </summary>
        /// <param name="barcode">The barcode to scan</param>
        /// <returns>Complete batch details including order, product, supplier, and inventory information</returns>
        [HttpGet("scan/{barcode}")]
        public async Task<ActionResult<BarcodeScanResponseDto>> ScanBarcode(string barcode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(barcode))
                {
                    return BadRequest(new { message = "Barcode is required" });
                }

                // Clean the barcode input
                barcode = barcode.TrimEnd(':').Trim();

                // Validate barcode format
                if (!_barcodeService.IsValidBarcodeFormat(barcode))
                {
                    return BadRequest(new { 
                        message = "Invalid barcode format. Expected format: PO{8chars}-P{8chars}-B{8chars}-{timestamp}-{4digits}",
                        barcode = barcode
                    });
                }

                var result = await _purchaseOrderService.GetByBarcodeAsync(barcode);
                if (result == null)
                {
                    return NotFound(new { 
                        message = "Barcode not found in the system",
                        barcode = barcode
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scanning barcode: {Barcode}", barcode);
                return StatusCode(500, new { 
                    message = "An error occurred while scanning the barcode",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Download barcode image for a specific barcode
        /// </summary>
        /// <param name="barcode">The barcode text</param>
        /// <param name="width">Image width (default: 300, min: 100, max: 2000)</param>
        /// <param name="height">Image height (default: 100, min: 50, max: 1000)</param>
        /// <returns>PNG image of the barcode</returns>
        [HttpGet("download/{barcode}")]
        public ActionResult DownloadBarcode(string barcode, [FromQuery] int width = 300, [FromQuery] int height = 100)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(barcode))
                {
                    return BadRequest(new { message = "Barcode is required" });
                }

                // Clean the barcode input - handle the specific issue from the screenshot
                barcode = barcode.TrimEnd(':').Trim();
                
                // Log the cleaned barcode for debugging
                _logger.LogInformation("Generating barcode image for: {OriginalBarcode} -> {CleanedBarcode}", 
                    barcode, barcode);

                // Validate dimensions
                if (width < 100 || width > 2000)
                {
                    return BadRequest(new { message = "Width must be between 100 and 2000 pixels" });
                }

                if (height < 50 || height > 1000)
                {
                    return BadRequest(new { message = "Height must be between 50 and 1000 pixels" });
                }

                var barcodeImage = _barcodeService.GenerateBarcodeImage(barcode, width, height);
                
                return File(barcodeImage, "image/png", $"barcode_{barcode}.png");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid barcode text for image generation: {Barcode}", barcode);
                return BadRequest(new { 
                    message = "Invalid barcode text for image generation",
                    details = ex.Message,
                    barcode = barcode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating barcode image for: {Barcode}", barcode);
                return StatusCode(500, new { 
                    message = "An error occurred while generating the barcode image",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Download QR code image for a specific barcode
        /// </summary>
        /// <param name="barcode">The barcode text</param>
        /// <param name="width">Image width (default: 300, min: 100, max: 2000)</param>
        /// <param name="height">Image height (default: 300, min: 100, max: 2000)</param>
        /// <returns>PNG image of the QR code</returns>
        [HttpGet("download-qr/{barcode}")]
        public ActionResult DownloadQrCode(string barcode, [FromQuery] int width = 300, [FromQuery] int height = 300)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(barcode))
                {
                    return BadRequest(new { message = "Barcode is required" });
                }

                // Clean the barcode input - handle the specific issue from the screenshot
                barcode = barcode.TrimEnd(':').Trim();
                
                // Log the cleaned barcode for debugging
                _logger.LogInformation("Generating QR code image for: {OriginalBarcode} -> {CleanedBarcode}", 
                    barcode, barcode);

                // Validate dimensions
                if (width < 100 || width > 2000)
                {
                    return BadRequest(new { message = "Width must be between 100 and 2000 pixels" });
                }

                if (height < 100 || height > 2000)
                {
                    return BadRequest(new { message = "Height must be between 100 and 2000 pixels" });
                }

                var qrCodeImage = _barcodeService.GenerateQrCodeImage(barcode, width, height);
                
                return File(qrCodeImage, "image/png", $"qrcode_{barcode}.png");
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid QR code text for image generation: {Barcode}", barcode);
                return BadRequest(new { 
                    message = "Invalid QR code text for image generation",
                    details = ex.Message,
                    barcode = barcode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating QR code image for: {Barcode}", barcode);
                return StatusCode(500, new { 
                    message = "An error occurred while generating the QR code image",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Validate barcode format
        /// </summary>
        /// <param name="barcode">The barcode to validate</param>
        /// <returns>Validation result</returns>
        [HttpGet("validate/{barcode}")]
        public ActionResult ValidateBarcode(string barcode)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(barcode))
                {
                    return BadRequest(new { message = "Barcode is required" });
                }

                // Clean the barcode input
                barcode = barcode.TrimEnd(':').Trim();

                var isValid = _barcodeService.IsValidBarcodeFormat(barcode);
                
                return Ok(new { 
                    barcode = barcode, 
                    isValid = isValid,
                    message = isValid ? "Barcode format is valid" : "Barcode format is invalid. Expected format: PO{8chars}-P{8chars}-B{8chars}-{timestamp}-{4digits}",
                    expectedFormat = "PO{8chars}-P{8chars}-B{8chars}-{timestamp}-{4digits}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating barcode: {Barcode}", barcode);
                return StatusCode(500, new { 
                    message = "An error occurred while validating the barcode",
                    details = ex.Message
                });
            }
        }
    }
} 