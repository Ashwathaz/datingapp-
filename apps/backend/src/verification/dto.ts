import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class IdVerificationDto {
  @IsIn(['passport', 'national_id', 'driver_license']) documentType!: string;
  @IsUrl() frontImageUrl!: string;
  @IsOptional() @IsUrl() backImageUrl?: string;
}

export class SelfieVerificationDto {
  @IsUrl() selfieVideoUrl!: string;
  @IsString() livenessSessionId!: string;
}

export class SocialVerificationDto {
  @IsOptional() @IsString() instagramUsername?: string;
  @IsOptional() @IsUrl() linkedInProfileUrl?: string;
}

export class ReferenceDto {
  @IsString() friendName!: string;
  @IsString() friendPhoneNumber!: string;
  @IsString() relationship!: string;
}

