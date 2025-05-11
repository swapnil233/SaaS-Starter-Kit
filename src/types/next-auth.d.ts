import "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
      emailVerified?: Date | null;
    };

    /** Always present after withAuth guard */
    accessToken: string;
  }

  export interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }

  export interface JWT {
    id: string;
    emailVerified?: Date | null;
    accessToken?: string;

    // Standard JWT claims
    iss?: string; // Issuer
    aud?: string; // Audience
    iat?: number; // Issued At
    jti?: string; // JWT ID
    exp?: number; // Expiration Time
    sub?: string; // Subject (user identifier)
  }
}
