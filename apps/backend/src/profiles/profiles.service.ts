import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/services/database.service';
import {
  BioDto,
  EntertainmentDto,
  InterestsDto,
  LifestyleDto,
  PersonalInfoDto,
  PreferencesDto,
  WorkEducationDto,
} from './dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DatabaseService) {}

  async upsertPersonal(userId: string, dto: PersonalInfoDto) {
    const age = this.ageFromDob(dto.dateOfBirth);
    if (age < 18) throw new BadRequestException('Users must be at least 18');
    return this.upsertProfile(userId, {
      date_of_birth: dto.dateOfBirth,
      gender: dto.gender,
      looking_for: dto.lookingFor,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      languages_spoken: dto.languagesSpoken,
    });
  }

  upsertPreferences(userId: string, dto: PreferencesDto) {
    return this.upsertProfile(userId, { relationship_goals: dto.relationshipGoals });
  }

  upsertWork(userId: string, dto: WorkEducationDto) {
    return this.upsertProfile(userId, {
      profession: dto.profession,
      company: dto.company,
      industry: dto.industry,
      college: dto.college,
      degree: dto.degree,
      graduation_year: dto.graduationYear,
    });
  }

  upsertLifestyle(userId: string, dto: LifestyleDto) {
    return this.upsertProfile(userId, {
      smoking: dto.smoking,
      drinking: dto.drinking,
      fitness_level: dto.fitnessLevel,
      diet_preference: dto.dietPreference,
      sleep_schedule: dto.sleepSchedule,
      travel_frequency: dto.travelFrequency,
    });
  }

  async setInterests(userId: string, dto: InterestsDto) {
    await this.db.query('delete from user_interests where user_id = $1', [userId]);
    for (const interest of dto.interests) {
      await this.db.query(
        `insert into interests (name)
         select $1
         where not exists (select 1 from interests where lower(name) = lower($1))`,
        [interest],
      );
      await this.db.query(
        `insert into user_interests (user_id, interest_id)
         select $1, id from interests where lower(name) = lower($2)
         on conflict do nothing`,
        [userId, interest],
      );
    }
    return { count: dto.interests.length };
  }

  upsertEntertainment(userId: string, dto: EntertainmentDto) {
    return this.upsertProfile(userId, {
      favorite_movies: dto.favoriteMovies.slice(0, 4),
      favorite_tv_shows: dto.favoriteTvShows.slice(0, 4),
      favorite_music_genres: dto.favoriteMusicGenres.slice(0, 4),
      favorite_games: dto.favoriteGames?.slice(0, 4) ?? [],
    });
  }

  upsertBio(userId: string, dto: BioDto) {
    return this.upsertProfile(userId, { bio: dto.bio });
  }

  async getProfile(userId: string) {
    const profile = await this.db.query('select * from profiles where user_id = $1', [userId]);
    const interests = await this.db.query(
      `select i.name from user_interests ui join interests i on i.id = ui.interest_id where ui.user_id = $1`,
      [userId],
    );
    return { ...profile.rows[0], interests: interests.rows.map((row) => row.name) };
  }

  private async upsertProfile(userId: string, fields: Record<string, unknown>) {
    const columns = Object.keys(fields).filter((key) => fields[key] !== undefined);
    if (!columns.length) throw new BadRequestException('No profile fields provided');
    const values = columns.map((key) => fields[key]);
    const assignments = columns.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const insertColumns = ['user_id', ...columns].join(', ');
    const insertParams = ['$1', ...columns.map((_, index) => `$${index + 2}`)].join(', ');
    const result = await this.db.query(
      `insert into profiles (${insertColumns})
       values (${insertParams})
       on conflict (user_id) do update set ${assignments}, updated_at = now()
       returning *`,
      [userId, ...values],
    );
    return result.rows[0];
  }

  private ageFromDob(dob: string) {
    const birthday = new Date(dob);
    const now = new Date();
    let age = now.getUTCFullYear() - birthday.getUTCFullYear();
    const m = now.getUTCMonth() - birthday.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < birthday.getUTCDate())) age -= 1;
    return age;
  }
}
