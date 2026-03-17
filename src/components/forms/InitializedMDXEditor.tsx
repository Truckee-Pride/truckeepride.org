'use client'

import {
  MDXEditor,
  type MDXEditorProps,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  BoldItalicUnderlineToggles,
  CreateLink,
  Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import './mdxeditor-overrides.css'
export function InitializedMDXEditor({ ...props }: MDXEditorProps) {
  const plugins = [
    headingsPlugin({ allowedHeadingLevels: [2, 3] }),
    listsPlugin(),
    linkPlugin(),
    linkDialogPlugin({ showLinkTitleField: false }),
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
          <Separator />
          <CreateLink />
        </>
      ),
    }),
  ]
  return <MDXEditor {...props} plugins={plugins} />
}
