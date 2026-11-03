import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, type Locale } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs';
import { BreadcrumbSchema } from '@/shared/ui-composite/SEO/BreadcrumbSchema';
import FAQSection from './FAQSection';
import { StructuredData } from '@/shared/ui-composite/SEO/StructuredData';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<{ locale: string }>;
```

### Explanation:
1. **Fixing the issue**: The issue was that the file was not properly closed, leading to a fence.
2. **Adding the necessary imports and functions**: The file now includes the necessary imports and functions to generate metadata and static parameters.

### Updated Code:
```typescript
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { generatePageMetadata } from '@/core/i18n/metadata-helpers';
import { routing, type Locale } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/ui-composite/B
