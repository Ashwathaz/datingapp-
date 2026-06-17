import { IsString, MaxLength } from 'class-validator';

export class ReportDto {
  @IsString() reportedUserId!: string;
  @IsString() @MaxLength(120) reason!: string;
  @IsString() @MaxLength(2000) details!: string;
}

export class ModerateDto {
  @IsString() status!: string;
  @IsString() @MaxLength(1000) note!: string;
}

