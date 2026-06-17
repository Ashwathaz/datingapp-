import { IsEmail, IsPhoneNumber, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @Length(1, 80) firstName!: string;
  @IsString() @Length(1, 80) lastName!: string;
  @IsString() @Length(3, 32) username!: string;
  @IsPhoneNumber() phoneNumber!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(12) password!: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

export class OtpDto {
  @IsString() code!: string;
}

export class RefreshTokenDto {
  @IsString() refreshToken!: string;
}
