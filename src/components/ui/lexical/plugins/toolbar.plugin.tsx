import * as stylex from '@stylexjs/stylex';

import { copyToClipboard } from '@lexical/clipboard';
import {
    $isListNode,
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, type HeadingTagType } from '@lexical/rich-text';
import { $isAtNodeEnd, $setBlocksType } from '@lexical/selection';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
    IconAbc,
    IconAlignCenter,
    IconAlignJustified,
    IconAlignLeft,
    IconAlignRight,
    IconArrowBackUp,
    IconArrowForwardUp,
    IconBold,
    IconCode,
    IconCopy,
    IconH1,
    IconH2,
    IconH3,
    IconH4,
    IconH5,
    IconH6,
    IconItalic,
    IconLetterCase,
    IconLetterCaseLower,
    IconLetterCaseUpper,
    IconLink,
    IconList,
    IconListCheck,
    IconListNumbers,
    IconQuote,
    IconStrikethrough,
    IconSubscript,
    IconSuperscript,
    IconTrash,
    IconUnderline,
} from '@tabler/icons-react';
import { produce } from 'immer';
import {
    $createParagraphNode,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    $isRootOrShadowRoot,
    $isTextNode,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    COPY_COMMAND,
    type ElementNode,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    type LexicalEditor,
    type LexicalNode,
    REDO_COMMAND,
    type RangeSelection,
    type TextNode,
    UNDO_COMMAND,
} from 'lexical';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Dropdown, DropdownItem } from '~/components/ui';

const styles = stylex.create({
    editorToolbar: {
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px 12px 0 0',
        borderColor: '#eee',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderBottomWidth: '0',
        padding: '4px',
        gap: '3px',
        height: '36px',
    },
    divider: {
        height: '100%',
        width: '1px',
        backgroundColor: '#eee',
        margin: '0 2px',
    },
    toolBarButton: {
        height: '36px',
        width: '36px',
        backgroundColor: {
            default: '#fff',
            ':hover': '#f0f0f0',
            ':active': '#eee',
        },
        borderWidth: '0',
        borderRadius: '8px',
        cursor: 'pointer',
        transitionDuration: '300ms',
        willChange: 'background-color, border-color',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toolBarButtonActive: {
        backgroundColor: '#f0f0f0',
        ':hover': {
            backgroundColor: '#eee',
        },
    },
    toolBarButtonDisabled: {
        color: '#ccc',
        cursor: 'not-allowed',
    },
    toolBarIcon: {
        width: '18px',
        height: '18px',
    },
    copyButton: {
        marginLeft: 'auto',
    },
});

function $findTopLevelElement(node: LexicalNode) {
    let topLevelElement =
        node.getKey() === 'root'
            ? node
            : $findMatchingParent(node, (e) => {
                  const parent = e.getParent();
                  return parent !== null && $isRootOrShadowRoot(parent);
              });

    if (topLevelElement === null) {
        topLevelElement = node.getTopLevelElementOrThrow();
    }
    return topLevelElement;
}

function $getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    }
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
}

const clearFormat = (editor: LexicalEditor) => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            for (const node of selection.getNodes()) {
                if ($isTextNode(node)) {
                    node.setFormat(0);
                }
            }
        }
    });
};

export const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const [toolbarState, setToolbarState] = useState({
        isBold: false,
        isItalic: false,
        isUnderline: false,
        canUndo: false,
        canRedo: false,
        blockType: 'paragraph',
        alignType: 'left',
        isLowercase: false,
        isUppercase: false,
        isCapitalized: false,
        isStrikethrough: false,
        isSuperscript: false,
        isSubscript: false,
    });

    const $handleUpdateBlockType = useCallback((selectedElement: LexicalNode) => {
        const type = $isHeadingNode(selectedElement)
            ? selectedElement.getTag()
            : $isListNode(selectedElement)
              ? selectedElement.getListType()
              : selectedElement.getType();

        setToolbarState((prev) =>
            produce(prev, (draft) => {
                draft.blockType = type;
            }),
        );
    }, []);

    const $handleUpdateAlignType = useCallback((selection: RangeSelection) => {
        const node = $getSelectedNode(selection);
        let alignType = 'left';
        if ($isElementNode(node)) {
            alignType = node.getFormatType();
        } else {
            const parent = node.getParent();
            if (parent && $isElementNode(parent)) {
                alignType = parent.getFormatType() || 'left';
            }
        }
        setToolbarState((prev) =>
            produce(prev, (draft) => {
                draft.alignType = alignType;
            }),
        );
    }, []);

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = $findTopLevelElement(anchorNode);

            // Update text format
            setToolbarState((prev) =>
                produce(prev, (draft) => {
                    draft.isBold = selection.hasFormat('bold');
                    draft.isItalic = selection.hasFormat('italic');
                    draft.isUnderline = selection.hasFormat('underline');
                    draft.isLowercase = selection.hasFormat('lowercase');
                    draft.isUppercase = selection.hasFormat('uppercase');
                    draft.isCapitalized = selection.hasFormat('capitalize');
                    draft.isStrikethrough = selection.hasFormat('strikethrough');
                    draft.isSuperscript = selection.hasFormat('superscript');
                    draft.isSubscript = selection.hasFormat('subscript');
                }),
            );

            // block type
            $handleUpdateBlockType(element);
            // align type
            $handleUpdateAlignType(selection);
        }
    }, [$handleUpdateBlockType, $handleUpdateAlignType]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(
                    () => {
                        $updateToolbar();
                    },
                    { editor },
                );
            }),
            editor.registerCommand(
                COPY_COMMAND,
                () => {
                    copyToClipboard(editor, null).then(() => true);
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setToolbarState((prev) => ({
                        ...prev,
                        canUndo: payload,
                    }));
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setToolbarState((prev) => ({
                        ...prev,
                        canRedo: payload,
                    }));
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor, $updateToolbar]);

    return (
        <div {...stylex.props(styles.editorToolbar)}>
            <button
                type="button"
                {...stylex.props(styles.toolBarButton, !toolbarState.canUndo && styles.toolBarButtonDisabled)}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                disabled={!toolbarState.canUndo}
                title="Undo (⌘Z)"
            >
                <IconArrowBackUp {...stylex.props(styles.toolBarIcon)} />
            </button>
            <button
                type="button"
                {...stylex.props(styles.toolBarButton, !toolbarState.canRedo && styles.toolBarButtonDisabled)}
                onClick={() => {
                    editor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                disabled={!toolbarState.canRedo}
                title="Redo (⇧⌘Y)"
            >
                <IconArrowForwardUp {...stylex.props(styles.toolBarIcon)} />
            </button>
            <Divider />
            <FormatDropdown editor={editor} blockType={toolbarState.blockType} />

            <Divider />

            <button
                type="button"
                {...stylex.props(styles.toolBarButton, toolbarState.isBold && styles.toolBarButtonActive)}
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                }}
                title="Bold (⌘+B)"
            >
                <IconBold {...stylex.props(styles.toolBarIcon)} />
            </button>
            <button
                type="button"
                {...stylex.props(styles.toolBarButton, toolbarState.isItalic && styles.toolBarButtonActive)}
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                }}
                title="Italic (⌘+I)"
            >
                <IconItalic {...stylex.props(styles.toolBarIcon)} />
            </button>
            <button
                type="button"
                {...stylex.props(styles.toolBarButton, toolbarState.isUnderline && styles.toolBarButtonActive)}
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                }}
                title="Underline (⌘+U)"
            >
                <IconUnderline {...stylex.props(styles.toolBarIcon)} />
            </button>
            <button
                type="button"
                {...stylex.props(styles.toolBarButton)}
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                }}
                title="Code"
            >
                <IconCode {...stylex.props(styles.toolBarIcon)} />
            </button>
            <button type="button" {...stylex.props(styles.toolBarButton)} title="Link">
                <IconLink {...stylex.props(styles.toolBarIcon)} />
            </button>
            <TextStyleDropdown editor={editor} />
            <Divider />
            <AlignDropdown editor={editor} alignType={toolbarState.alignType} />
            <button
                type="button"
                {...stylex.props(styles.toolBarButton, styles.copyButton)}
                onClick={() => {
                    editor.dispatchCommand(COPY_COMMAND, null);
                }}
                title="Copy (⌘+C)"
            >
                <IconCopy {...stylex.props(styles.toolBarIcon)} />
            </button>
        </div>
    );
};

const Divider = () => {
    return <div {...stylex.props(styles.divider)} />;
};

const FormatDropdown = ({ editor, blockType }: { editor: LexicalEditor; blockType: string }) => {
    const options = {
        paragraph: {
            icon: <IconLetterCase {...stylex.props(styles.toolBarIcon)} />,
            label: 'Paragraph',
            value: 'paragraph',
        },
        h1: {
            icon: <IconH1 {...stylex.props(styles.toolBarIcon)} />,
            label: 'Heading 1',
            value: 'h1',
        },
        h2: {
            icon: <IconH2 {...stylex.props(styles.toolBarIcon)} />,
            label: 'Heading 2',
            value: 'h2',
        },
        h3: {
            icon: <IconH3 {...stylex.props(styles.toolBarIcon)} />,
            label: 'Heading 3',
            value: 'h3',
        },
        h4: {
            icon: <IconH4 {...stylex.props(styles.toolBarIcon)} />,
            label: 'Heading 4',
            value: 'h4',
        },
        h5: {
            icon: <IconH5 {...stylex.props(styles.toolBarIcon)} />,
            label: 'Heading 5',
            value: 'h5',
        },
        h6: {
            icon: <IconH6 {...stylex.props(styles.toolBarIcon)} />,
            label: 'Heading 6',
            value: 'h6',
        },
        number: {
            icon: <IconListNumbers {...stylex.props(styles.toolBarIcon)} />,
            label: 'Ordered List',
            value: 'number',
        },
        bullet: {
            icon: <IconList {...stylex.props(styles.toolBarIcon)} />,
            label: 'Bulleted List',
            value: 'bullet',
        },
        check: {
            icon: <IconListCheck {...stylex.props(styles.toolBarIcon)} />,
            label: 'Checked List',
            value: 'check',
        },
        quote: {
            icon: <IconQuote {...stylex.props(styles.toolBarIcon)} />,
            label: 'Quote',
            value: 'quote',
        },
    };

    const format = (value: string) => {
        switch (value) {
            case options.paragraph.value:
                formatParagraph();
                break;
            case options.h1.value:
                formatHeading('h1');
                break;
            case options.h2.value:
                formatHeading('h2');
                break;
            case options.h3.value:
                formatHeading('h3');
                break;
            case options.h4.value:
                formatHeading('h4');
                break;
            case options.h5.value:
                formatHeading('h5');
                break;
            case options.h6.value:
                formatHeading('h6');
                break;
            case options.quote.value:
                formatQuote(blockType);
                break;
            case options.bullet.value:
                formatBulletList(blockType);
                break;
            case options.number.value:
                formatNumberedList(blockType);
                break;
            case options.check.value:
                formatCheckList(blockType);
                break;
        }
    };

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (headingSize: HeadingTagType) => {
        editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatBulletList = (blockType: string) => {
        if (blockType !== options.bullet.value) {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatCheckList = (blockType: string) => {
        if (blockType !== options.check.value) {
            console.log(blockType);
            editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatNumberedList = (blockType: string) => {
        if (blockType !== options.number.value) {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatQuote = (blockType: string) => {
        if (blockType !== options.quote.value) {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createQuoteNode());
            });
        }
    };

    return (
        <Dropdown label={formatDropdownLabel(options[blockType as keyof typeof options])} triggerWidth={168}>
            {Object.values(options).map((option) => (
                <DropdownItem
                    key={option.value}
                    onClick={() => format(option.value)}
                    // isActive={option.value === blockType}
                >
                    {option.icon}
                    {option.label}
                </DropdownItem>
            ))}
        </Dropdown>
    );
};

const AlignDropdown = ({ editor, alignType }: { editor: LexicalEditor; alignType: string }) => {
    const options = {
        left: {
            icon: <IconAlignLeft {...stylex.props(styles.toolBarIcon)} />,
            label: 'Left Align',
            value: 'left',
        },
        center: {
            icon: <IconAlignCenter {...stylex.props(styles.toolBarIcon)} />,
            label: 'Center Align',
            value: 'center',
        },
        right: {
            icon: <IconAlignRight {...stylex.props(styles.toolBarIcon)} />,
            label: 'Right Align',
            value: 'right',
        },
        justify: {
            icon: <IconAlignJustified {...stylex.props(styles.toolBarIcon)} />,
            label: 'Justify Align',
            value: 'justify',
        },
    };

    const format = (value: string) => {
        switch (value) {
            case options.left.value:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                break;
            case options.center.value:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                break;
            case options.right.value:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                break;
            case options.justify.value:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                break;
        }
    };

    const currentOption = options[alignType as keyof typeof options] || options.left;

    return (
        <Dropdown label={formatDropdownLabel(currentOption)} triggerWidth={160}>
            {Object.values(options).map((option) => (
                <DropdownItem key={option.value} onClick={() => format(option.value)}>
                    {option.icon}
                    {option.label}
                </DropdownItem>
            ))}
        </Dropdown>
    );
};

const TextStyleDropdown = ({ editor }: { editor: LexicalEditor }) => {
    const options = {
        lowercase: {
            icon: <IconLetterCaseLower {...stylex.props(styles.toolBarIcon)} />,
            label: 'Lowercase',
            value: 'lowercase',
        },
        uppercase: {
            icon: <IconLetterCaseUpper {...stylex.props(styles.toolBarIcon)} />,
            label: 'Uppercase',
            value: 'uppercase',
        },
        capitalize: {
            icon: <IconAbc {...stylex.props(styles.toolBarIcon)} />,
            label: 'Capitalize',
            value: 'capitalize',
        },
        strikethrough: {
            icon: <IconStrikethrough {...stylex.props(styles.toolBarIcon)} />,
            label: 'Strikethrough',
            value: 'strikethrough',
        },
        superscript: {
            icon: <IconSuperscript {...stylex.props(styles.toolBarIcon)} />,
            label: 'Superscript',
            value: 'superscript',
        },
        subscript: {
            icon: <IconSubscript {...stylex.props(styles.toolBarIcon)} />,
            label: 'Subscript',
            value: 'subscript',
        },
        clearFormatting: {
            icon: <IconTrash {...stylex.props(styles.toolBarIcon)} />,
            label: 'Clear formatting',
            value: 'clear-formatting',
        },
    };

    const format = (value: string) => {
        switch (value) {
            case options.lowercase.value:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'lowercase');
                break;
            case options.uppercase.value:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'uppercase');
                break;
            case options.capitalize.value:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'capitalize');
                break;
            case options.strikethrough.value:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                break;
            case options.superscript.value:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript');
                break;
            case options.subscript.value:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript');
                break;
            case options.clearFormatting.value:
                clearFormat(editor);
                break;
        }
    };

    return (
        <Dropdown label="Aa">
            {Object.values(options).map((option) => (
                <DropdownItem key={option.value} onClick={() => format(option.value)}>
                    {option.icon}
                    {option.label}
                </DropdownItem>
            ))}
        </Dropdown>
    );
};

const formatDropdownLabel = ({ label, icon }: { label: string; icon: ReactNode }) => {
    return (
        <>
            {icon}
            {label}
        </>
    );
};
