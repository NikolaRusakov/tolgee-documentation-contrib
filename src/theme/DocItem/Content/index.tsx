import React, { type ReactNode } from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import { LlmPageActions } from '../../../component/docs/LlmPageActions';

type Props = WrapperProps<typeof ContentType>;

/**
 * Adds the "Copy page / open in an AI assistant" menu above the article body.
 * The menu renders only for docs that have a Markdown twin (see LlmPageActions).
 */
export default function ContentWrapper(props: Props): ReactNode {
  return (
    <>
      <LlmPageActions />
      <Content {...props} />
    </>
  );
}
