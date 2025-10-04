import * as stylex from '@stylexjs/stylex';

import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { type Provider } from '@lexical/yjs';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type * as Y from 'yjs';
import { createWebRTCProvider, createWebsocketProvider } from './collaboration/providers.ts';
import { type UserProfile, getRandomUserProfile } from './collaboration/user-profiles.ts';
import { ToolbarPlugin } from './plugins/toolbar.plugin';
import { styles } from './styles.ts';

const theme = {
    paragraph: stylex.props(styles.paragraph).className,
    text: {
        bold: stylex.props(styles.textBold).className,
        italic: stylex.props(styles.textItalic).className,
        underline: stylex.props(styles.textUnderline).className,
        superscript: stylex.props(styles.superscript).className,
        subscript: stylex.props(styles.subscript).className,
        underlineStrikethrough: stylex.props(styles.underlineStrikethrough).className,
        strikethrough: stylex.props(styles.strikethrough).className,
        uppercase: stylex.props(styles.uppercase).className,
        lowercase: stylex.props(styles.lowercase).className,
        code: stylex.props(styles.code).className,
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
        listitem: stylex.props(styles.listItem).className,
        // listitemChecked: 'PlaygroundEditorTheme__listItemChecked',
        // listitemUnchecked: 'PlaygroundEditorTheme__listItemUnchecked',
        listitemChecked: stylex.props(styles.checklistItemBase, styles.listItemChecked).className,
        listitemUnchecked: stylex.props(styles.checklistItemBase, styles.listItemUnchecked).className,
        nested: {
            listitem: stylex.props(styles.nestedListItem).className,
        },
        olDepth: [
            stylex.props(styles.ol1).className ?? '',
            stylex.props(styles.ol2).className ?? '',
            stylex.props(styles.ol3).className ?? '',
            stylex.props(styles.ol4).className ?? '',
            stylex.props(styles.ol5).className ?? '',
        ],
        ul: stylex.props(styles.ul).className,
    },
    quote: stylex.props(styles.quote).className,
};

const placeholder = 'Enter some rich text...';

function onError(error: unknown) {
    console.error(error);
}

interface ActiveUserProfile extends UserProfile {
    userId: number;
}

const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [ListNode, ListItemNode, HeadingNode, QuoteNode, CodeHighlightNode, CodeNode, LinkNode],
    editorState: null,
};

export const LexicalEditor = () => {
    const providerName = new URLSearchParams(window.location.search).get('provider') ?? 'webrtc';
    const [userProfile, setUserProfile] = useState(() => getRandomUserProfile());
    const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
    const [connected, setConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState<ActiveUserProfile[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleAwarenessUpdate = useCallback(() => {
        const awareness = yjsProvider?.awareness;
        setActiveUsers(
            Array.from(awareness?.getStates().entries() ?? []).map(([userId, { color, name }]) => ({
                color,
                name,
                userId,
            })),
        );
    }, [yjsProvider]);

    const handleConnectionToggle = () => {
        if (yjsProvider == null) {
            return;
        }
        if (connected) {
            yjsProvider.disconnect();
        } else {
            yjsProvider.connect();
        }
    };

    useEffect(() => {
        if (yjsProvider == null) {
            return;
        }

        yjsProvider.awareness.on('update', handleAwarenessUpdate);

        return () => yjsProvider.awareness.off('update', handleAwarenessUpdate);
    }, [yjsProvider, handleAwarenessUpdate]);

    const providerFactory = useCallback(
        (id: string, yjsDocMap: Map<string, Y.Doc>) => {
            console.log("🚀 ~ LexicalEditor ~ yjsDocMap:", yjsDocMap)
            const provider =
                providerName === 'webrtc'
                    ? createWebRTCProvider(id, yjsDocMap)
                    : createWebsocketProvider(id, yjsDocMap);
            provider.on('status', (event) => {
                setConnected(
                    // Websocket provider
                    event.status === 'connected' ||
                        // WebRTC provider has different approact to status reporting
                        ('connected' in event && event.connected === true),
                );
            });
         setTimeout(() => setYjsProvider(provider), 0);

            return provider;
        },
        [providerName],
    );

    return (
        <div ref={containerRef}>
            <p>
                <b>Used provider:</b>{' '}
                {providerName === 'webrtc'
                    ? 'WebRTC (within browser communication via BroadcastChannel fallback, unless run locally)'
                    : 'Websockets (cross-browser communication)'}
                <br />
                {window.location.hostname === 'localhost' ? (
                    providerName === 'webrtc' ? (
                        <a href="/lexical?provider=wss">Enable WSS</a>
                    ) : (
                        <a href="/lexical">Enable WebRTC</a>
                    )
                ) : null}{' '}
                {/* WebRTC provider doesn't implement disconnect correctly */}
                {providerName !== 'webrtc' ? (
                    <button type="button" onClick={handleConnectionToggle}>
                        {connected ? 'Disconnect' : 'Connect'}
                    </button>
                ) : null}
            </p>
            <p>
                <b>My Name:</b>{' '}
                <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile((profile) => ({ ...profile, name: e.target.value }))}
                />{' '}
                <input
                    type="color"
                    value={userProfile.color}
                    onChange={(e) => setUserProfile((profile) => ({ ...profile, color: e.target.value }))}
                />
            </p>
            <p>
                <b>Active users:</b>{' '}
                {activeUsers.map(({ name, color, userId }, idx) => (
                    <Fragment key={userId}>
                        <span style={{ color }}>{name}</span>
                        {idx === activeUsers.length - 1 ? '' : ', '}
                    </Fragment>
                ))}
            </p>

            <LexicalComposer initialConfig={initialConfig}>
                <div>
                    <ToolbarPlugin />
                    <div {...stylex.props(styles.editorInner)}>
                         <CollaborationPlugin
                            id="collab"
                            providerFactory={providerFactory}
                            shouldBootstrap={false}
                            username={userProfile.name}
                            cursorColor={userProfile.color}
                            cursorsContainerRef={containerRef}
                        />
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
                        {/* <HistoryPlugin /> */}
                        <AutoFocusPlugin />
                        <CheckListPlugin />
                        <TabIndentationPlugin maxIndent={7} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                       
                    </div>
                </div>
            </LexicalComposer>
        </div>
    );
};
