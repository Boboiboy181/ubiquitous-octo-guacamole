import * as stylex from '@stylexjs/stylex';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ToolbarPlugin } from './plugins/toolbar.plugin';
import { styles } from './styles.ts';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';

const theme = {
    paragraph: stylex.props(styles.paragraph).className,
    text: {
        bold: stylex.props(styles.textBold).className,
        italic: stylex.props(styles.textItalic).className,
        underline: stylex.props(styles.textUnderline).className,
    },
    heading: {
        h1: stylex.props(styles.h1).className,
        h2: stylex.props(styles.h2).className,
        h3: stylex.props(styles.h3).className,
        h4: stylex.props(styles.h4).className,
        h5: stylex.props(styles.h5).className,
        h6: stylex.props(styles.h6).className,
    },
    list: {
        checklist: 'PlaygroundEditorTheme__checklist',
        listitem: stylex.props(styles.listItem).className!,
        listitemChecked: 'PlaygroundEditorTheme__listItemChecked',
        listitemUnchecked: 'PlaygroundEditorTheme__listItemUnchecked',
        nested: {
            listitem: stylex.props(styles.nestedListItem).className!,
        },
        olDepth: [
            stylex.props(styles.ol1).className!,
            stylex.props(styles.ol2).className!,
            stylex.props(styles.ol3).className!,
            stylex.props(styles.ol4).className!,
            stylex.props(styles.ol5).className!,
        ],
        ul: stylex.props(styles.ul).className,
    },
    quote: stylex.props(styles.quote).className,
};

const placeholder = 'Enter some rich text...';

function onError(error: unknown) {
    console.error(error);
}

export const LexicalEditor = () => {
    const markdown = '';

    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
        nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode, CodeHighlightNode, CodeNode, LinkNode],
        editorState: () => $convertFromMarkdownString(markdown, TRANSFORMERS),
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div>
                <ToolbarPlugin />
                <div {...stylex.props(styles.editorInner)}>
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                {...stylex.props(styles.editorContent)}
                                aria-placeholder={placeholder}
                                placeholder={<div {...stylex.props(styles.editorPlaceholder)}>{placeholder}</div>}
                            />
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin
                        onChange={(e) => {
                            e.read(() => {});
                        }}
                    />
                    <ListPlugin />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <TabIndentationPlugin maxIndent={7} />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                </div>
            </div>
        </LexicalComposer>
    );
};
