// Conditional font loading based on environment
// In development, we skip font loading to improve performance
// In production, we load the full font definitions

type DecorationFont = {
  name: string;
  font: {
    className: string;
  };
};

// Use the appropriate fonts based on environment
export const decorationFonts: DecorationFont[] =
  process.env.NODE_ENV === 'production'
    ? require('./decorationFonts.prod').decorationFonts
    : []; // Empty array in development to avoid Next.js font compilation
