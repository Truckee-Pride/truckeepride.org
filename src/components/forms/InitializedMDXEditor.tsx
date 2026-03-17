'use client'

import {
  MDXEditor,
  type MDXEditorProps,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  linkPlugin,
  linkDialogPlugin,
  markdownShortcutPlugin,
  diffSourcePlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  Separator,
  UndoRedo,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import './mdxeditor-overrides.css'

const plugins = [
  headingsPlugin({ allowedHeadingLevels: [2, 3] }),
  listsPlugin(),
  quotePlugin(),
  linkPlugin(),
  linkDialogPlugin(),
  markdownShortcutPlugin(),
  diffSourcePlugin({ viewMode: 'rich-text' }),
  toolbarPlugin({
    toolbarContents: () => (
      <DiffSourceToggleWrapper>
        <UndoRedo />
        <Separator />
        <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
        <Separator />
        <ListsToggle />
        <Separator />
        <BlockTypeSelect />
        <Separator />
        <CreateLink />
      </DiffSourceToggleWrapper>
    ),
  }),
]

export function InitializedMDXEditor(props: MDXEditorProps) {
  return <MDXEditor {...props} plugins={plugins} />
}
