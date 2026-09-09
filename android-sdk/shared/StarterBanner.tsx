import React from 'react';
import Link from '@docusaurus/Link';
import Admonition from '@theme/Admonition';

const STARTERS =
  'https://github.com/tolgee/tolgee-mobile-kotlin-sdk/tree/master/starters';

/** Points at the starter app the page's snippets are copied from. */
export default function StarterBanner({
  starter,
  label,
}: {
  starter: 'android-views' | 'jetpack-compose';
  label: string;
}): JSX.Element {
  return (
    <Admonition type="tip" title="Working example">
      Every snippet on this page is a file in the{' '}
      <Link href={`${STARTERS}/${starter}`}>{label} starter app</Link>, a
      complete project that Tolgee builds on every commit. Clone it to see the
      integration running before you copy it into your app.
    </Admonition>
  );
}
