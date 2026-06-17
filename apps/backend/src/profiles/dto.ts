import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PersonalInfoDto {
  @IsDateString() dateOfBirth!: string;
  @IsString() gender!: string;
  @IsArray() lookingFor!: string[];
  @IsString() city!: string;
  @IsString() state!: string;
  @IsString() country!: string;
  @IsArray() languagesSpoken!: string[];
}

export class PreferencesDto {
  @IsArray() @ArrayMinSize(1) relationshipGoals!: string[];
}

export class WorkEducationDto {
  @IsOptional() @IsString() profession?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() college?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsInt() @Min(1940) @Max(2100) graduationYear?: number;
}

export class LifestyleDto {
  @IsOptional() @IsString() smoking?: string;
  @IsOptional() @IsString() drinking?: string;
  @IsOptional() @IsString() fitnessLevel?: string;
  @IsOptional() @IsString() dietPreference?: string;
  @IsOptional() @IsString() sleepSchedule?: string;
  @IsOptional() @IsString() travelFrequency?: string;
}

export class InterestsDto {
  @IsArray() @ArrayMinSize(5) interests!: string[];
}

export class EntertainmentDto {
  @IsArray() favoriteMovies!: string[];
  @IsArray() favoriteTvShows!: string[];
  @IsArray() favoriteMusicGenres!: string[];
  @IsOptional() @IsArray() favoriteGames?: string[];
}

export class BioDto {
  @IsString() @MaxLength(500) bio!: string;
}

