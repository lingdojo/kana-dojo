'use client';

import React from 'react';
import { Link as NextIntlLink } from '@/core/i18n/routing';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextIntlLink>;

export function Link(props: LinkProps) {
  return <NextIntlLink {...props} />;
}

export default Link;
