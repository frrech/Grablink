export class AccessResponseDto {
  code: string;
  url: string;
  title?: string;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  qrCode: string;
}
