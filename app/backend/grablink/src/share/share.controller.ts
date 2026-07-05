import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ShareService } from './share.service';
import { QrCodeService } from './qr-code.service';
import { CreateShareDto } from './dto/create-share.dto';
import { ShareResponseDto } from './dto/share-response.dto';
import { AccessResponseDto } from './dto/access-response.dto';

@Controller('share')
export class ShareController {
  constructor(
    private readonly shareService: ShareService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  /**
   * POST /share
   * Device A sends a URL to generate a 6-digit code
   */
  @Post()
  async createShare(@Body() createShareDto: CreateShareDto): Promise<ShareResponseDto> {
    const share = await this.shareService.createShare(createShareDto);

    return {
      code: share.code,
      url: share.url,
      expiresAt: share.expiresAt,
    };
  }

  /**
   * GET /share/:code
   * Device B uses the code to retrieve the URL and title
   */
  @Get(':code')
  async accessShare(@Param('code') code: string): Promise<AccessResponseDto> {
    const share = await this.shareService.accessShare(code);

    // Generate QR code asynchronously
    const qrCode = await this.qrCodeService.generateQrCode(share.url);

    return {
      code: share.code,
      url: share.url,
      title: share.title,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      accessCount: share.accessCount,
      qrCode,
    };
  }
}


