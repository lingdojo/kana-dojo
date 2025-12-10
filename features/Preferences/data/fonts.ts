// Conditional font loading based on environment
// In development, we skip font loading to improve performance
// In production, we load the full font definitions

type FontConfig = {
  name: string;
  font: {
    className: string;
  };
};

// Use the appropriate fonts based on environment
const fonts: FontConfig[] =
  process.env.NODE_ENV === 'production' ? require('./fonts.prod').default : []; // Empty array in development to avoid Next.js font compilation

export default fonts;
