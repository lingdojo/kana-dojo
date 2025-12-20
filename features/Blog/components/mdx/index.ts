/**
 * MDX Component Mappings
 * Exports all custom MDX components for use in blog posts.
 * These components can be used directly in MDX files without importing.
 */

// Component exports
export { FuriganaText, default as FuriganaTextDefault } from './FuriganaText';
export {
  KanaChart,
  default as KanaChartDefault,
  BASE_CHARACTER_COUNT,
  EXTENDED_CHARACTER_COUNT
} from './KanaChart';
export {
  InfoBox,
  default as InfoBoxDefault,
  VALID_INFOBOX_TYPES,
  type InfoBoxType
} from './InfoBox';
export { QuizQuestion, default as QuizQuestionDefault } from './QuizQuestion';

// Import components for mappings
import { FuriganaText } from './FuriganaText';
import { KanaChart } from './KanaChart';
import { InfoBox } from './InfoBox';
import { QuizQuestion } from './QuizQuestion';

/**
 * MDX component mappings for the MDX renderer.
 * Use this object when configuring MDX to enable custom components.
 *
 * @example
 * import { mdxComponents } from '@/features/Blog/components/mdx';
 *
 * <MDXRemote source={content} components={mdxComponents} />
 */
export const mdxComponents = {
  FuriganaText,
  KanaChart,
  InfoBox,
  QuizQuestion
};
