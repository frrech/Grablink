import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  /**
   * Generate a QR code for the given URL
   * Returns a data URL that can be embedded directly in HTML or returned in API response
   * 
   * @param url - The URL to encode in the QR code
   * @returns Promise<string> - Base64 encoded PNG image as data URL
   * @example
   * const qrCodeData = await qrCodeService.generateQrCode('https://example.com');
   * // Returns: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
   */
  async generateQrCode(url: string): Promise<string> {
    try {
      this.logger.log(`Generating QR code for URL: ${url}`);
      
      // Generate QR code as data URL (base64 encoded PNG)
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        type: 'image/png',
        width: 300,        // 300px wide
        margin: 2,         // 2px margin around code
        color: {
          dark: '#000000', // Black modules
          light: '#FFFFFF' // White background
        }
      });
      
      this.logger.debug(`QR code generated successfully for URL: ${url}`);
      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error(`Failed to generate QR code for URL: ${url}`, error);
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }

  /**
   * Alternative: Generate QR code as PNG buffer (useful for file storage)
   * 
   * @param url - The URL to encode
   * @returns Promise<Buffer> - PNG image buffer
   */
  async generateQrCodeBuffer(url: string): Promise<Buffer> {
    try {
      this.logger.log(`Generating QR code buffer for URL: ${url}`);
      
      const buffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      this.logger.debug(`QR code buffer generated successfully`);
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to generate QR code buffer for URL: ${url}`, error);
      throw new Error(`QR code buffer generation failed: ${error.message}`);
    }
  }
}
