'use client'

import {
  MDXEditor,
  type MDXEditorProps,
  type ViewMode,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  markdownShortcutPlugin,
  diffSourcePlugin,
  BoldItalicUnderlineToggles,
  CreateLink,
  Separator,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import './mdxeditor-overrides.css'

const MODES_WITH_DIFF: ViewMode[] = ['rich-text', 'source', 'diff']
const MODES_WITHOUT_DIFF: ViewMode[] = ['rich-text', 'source']

type Props = MDXEditorProps & { showDiff?: boolean }

export function InitializedMDXEditor({ showDiff = false, ...props }: Props) {
  const plugins = [
    headingsPlugin({ allowedHeadingLevels: [2, 3] }),
    listsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    markdownShortcutPlugin(),
    diffSourcePlugin({
      viewMode: 'rich-text',
      diffMarkdown: props.markdown?.replace(/[ \t]+$/gm, ''),
    }),
    toolbarPlugin({
      toolbarContents: () => (
        <DiffSourceToggleWrapper
          options={showDiff ? MODES_WITH_DIFF : MODES_WITHOUT_DIFF}
        >
          <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
          <Separator />
          <CreateLink />
        </DiffSourceToggleWrapper>
      ),
    }),
  ]
  return <MDXEditor {...props} plugins={plugins} />
}
