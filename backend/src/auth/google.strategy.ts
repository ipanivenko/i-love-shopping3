import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['openid', 'email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    return {
      provider: 'google',
      providerAccountId: profile.id,     //Google's unique internal ID
      email: profile.emails?.[0]?.value ?? null,//Navigates Google's nested array to grab the primary email address
      emailVerified: true,                        // see note below
      name: profile.displayName ?? null,
    };
  }
}
