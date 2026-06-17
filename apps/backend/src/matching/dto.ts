import { IsIn, IsOptional, IsString } from 'class-validator';

export class DiscoveryActionDto {
  @IsString() targetUserId!: string;
  @IsIn(['like', 'pass', 'super_like', 'save', 'hide', 'block']) action!: string;
}

export class RecommendationQueryDto {
  @IsOptional() @IsString() city?: string;
}

