import { NextResponse } from 'next/server';

/**
 * Security.txt route handler
 * Serves security policy information at /.well-known/security.txt and /security.txt
 * https://securitytxt.org/
 */
export async function GET() {
  const securityTxt = `Contact: https://github.com/lingdojo/kanadojo/security
Contact: mailto:security@kanadojo.com
Expires: 2026-12-31T23:59:59.000Z
Preferred-Languages: en, es
Canonical: https://kanadojo.com/.well-known/security.txt
Policy: https://kanadojo.com/security
Acknowledgments: https://kanadojo.com/credits

# Security Policy for KanaDojo
# If you discover a security vulnerability, please report it responsibly.
# See our security policy at https://kanadojo.com/security for details.`;

  return new NextResponse(securityTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  });
}
