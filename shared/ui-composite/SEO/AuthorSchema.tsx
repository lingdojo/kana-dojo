import Script from 'next/script';

export interface AuthorSchemaProps {
  name: string;
  url?: string;
  /** Author's profile image URL */
  image?: string;
  /** Job title or role */
  jobTitle?: string;
  /** Organization/affiliation */
  affiliation?: string;
  /** Educational background */
  alumniOf?: string;
  /** Area of expertise */
  expertise?: string;
  /** Years of experience */
  yearsOfExperience?: number;
  /** Professional credentials or certifications */
  credentials?: string[];
  /** Social media profiles */
  sameAs?: string[];
  /** Email (optional) */
  email?: string;
  /** Short biography */
  description?: string;
}

export function generateAuthorSchema(props: AuthorSchemaProps) {
  const {
    name,
    url,
    image,
    jobTitle,
    affiliation,
    alumniOf,
    expertise,
    yearsOfExperience,
    credentials,
    sameAs,
    email,
    description,
  } = props;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
  };

  if (url) schema.url = url;
  if (image) schema.image = image;
  if (jobTitle) schema.jobTitle = jobTitle;
  if (description) schema.description = description;
  if (email) schema.email = email;

  if (affiliation) {
    schema.affiliation = {
      '@type': 'Organization',
      name: affiliation,
    };
  }

  if (alumniOf) {
    schema.alumniOf = {
      '@type': 'EducationalOrganization',
      name: alumniOf,
    };
  }

  if (expertise) {
    schema.knowsAbout = expertise;
  }

  if (yearsOfExperience) {
    schema.hasOccupation = {
      '@type': 'Occupation',
      name: jobTitle || 'Educator',
      experienceRequirements: `${yearsOfExperience} years of experience`,
    };
  }

  if (credentials && credentials.length > 0) {
    schema.hasCredential = credentials.map((credential) => ({
      '@type': 'EducationalOccupationalCredential',
      name: credential,
    }));
  }

  if (sameAs && sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
}

/**
 * Author Schema Component for E-E-A-T signals
 * Generates structured data showing author expertise, credentials, and authority
 * Critical for educational content and Bing rankings
 *
 * @example
 * <AuthorSchema
 *   name="John Tanaka"
 *   url="https://kanadojo.com/authors/john-tanaka"
 *   jobTitle="Japanese Language Instructor"
 *   expertise="Japanese Language Education, JLPT Preparation"
 *   yearsOfExperience={10}
 *   credentials={["JLPT N1 Certified", "Licensed Japanese Language Teacher"]}
 * />
 */
export function AuthorSchema(props: AuthorSchemaProps) {
  const schema = generateAuthorSchema(props);

  return (
    <Script
      id='author-schema'
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Generate simple author schema for blog posts
 * Use when you don't need full E-E-A-T markup
 */
export function generateSimpleAuthorSchema(name: string, url?: string) {
  return {
    '@type': 'Person',
    name,
    ...(url && { url }),
  };
}
