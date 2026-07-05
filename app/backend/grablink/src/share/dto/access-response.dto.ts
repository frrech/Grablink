export class AccessResponseDto {
  code: string;
  url: string;
  title?: string;
  expiresAt: Date;
  createdAt: Date;
  qrCode?: string;
}
