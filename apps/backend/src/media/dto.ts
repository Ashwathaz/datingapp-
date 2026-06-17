import { IsBoolean, IsIn, IsInt, IsUrl, Max, Min } from 'class-validator';

export class MediaUploadDto {
  @IsUrl() url!: string;
  @IsIn(['photo', 'video']) type!: string;
  @IsBoolean() isFacePhoto!: boolean;
  @IsBoolean() isFullBody!: boolean;
  @IsInt() @Min(0) @Max(5) position!: number;
}

