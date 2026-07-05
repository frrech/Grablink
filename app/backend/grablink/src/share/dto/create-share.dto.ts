import { IsUrl } from 'class-validator';

export class CreateShareDto {
  @IsUrl()
  url: string;
}
