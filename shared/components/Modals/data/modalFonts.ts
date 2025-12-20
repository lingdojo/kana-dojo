// Conditional font loading based on environment
// In development, we skip font loading to improve performance
// In production, we load the full font definitions

type modalFont = {
  name: string;
  font: {
    className: string;
  };
};

// Use the appropriate fonts based on environment
export const modalFonts: modalFont[] =
  process.env.NODE_ENV === 'production'
    ? require('./modalFonts.prod').modalFonts
    : []; // Empty array in development to avoid Next.js font compilation
