'use client'

import { forwardRef } from 'react'
import {
  MDXEditor,
  type MDXEditorMethods,
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
export const InitializedMDXEditor = forwardRef<
  MDXEditorMethods,
  MDXEditorProps
>(function InitializedMDXEditor(props, ref) {
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
  return <MDXEditor {...props} ref={ref} plugins={plugins} />
})
