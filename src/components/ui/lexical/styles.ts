import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
    editorContainer: {
        padding: '16px',
        borderRadius: '4px',
        backgroundColor: '#fff',
    },
    editorInner: {
        position: 'relative',
    },
    editorContent: {
        minHeight: '100px',
        borderRadius: '0 0 12px 12px',
        backgroundColor: '#ffffff',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: '#eee',
        padding: '15px 10px',
        outline: 'none',
        position: 'relative',
    },
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
    editorPlaceholder: {
        color: '#aaa',
        fontStyle: 'italic',
        position: 'absolute',
        top: '15px',
        left: '10px',
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
    paragraph: {
        margin: '0 0 10px 0',
    },
    textBold: {
        fontWeight: 'bold',
    },
    textItalic: {
        fontStyle: 'italic',
    },
    textUnderline: {
        textDecoration: 'underline',
    },
    h1: {
        margin: 0,
        fontSize: '2rem',        // 32px
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: '#1a1a1a',
    },
    h2: {
        margin: 0,
        fontSize: '1.75rem',     // 28px
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
        color: '#1a1a1a',
    },
    h3: {
        margin: 0,
        fontSize: '1.5rem',      // 24px
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: '#2a2a2a',
    },
    h4: {
        margin: 0,
        fontSize: '1.25rem',     // 20px
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: 0,
        color: '#2a2a2a',
    },
    h5: {
        margin: 0,
        fontSize: '1.125rem',    // 18px
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: 0,
        color: '#3a3a3a',
    },
    h6: {
        margin: 0,
        fontSize: '1rem',        // 16px
        fontWeight: 600,
        lineHeight: 1.45,
        letterSpacing: 0,
        color: '#4a4a4a',
    },
    ol1: {
        padding: 0,
        margin: 0,
        listStylePosition: 'outside',
    },
    ol2: {
        padding: 0,
        margin: 0,
        listStyleType: 'upper-alpha',
        listStylePosition: 'outside',
    },
    ol3: {
        padding: 0,
        margin: 0,
        listStyleType: 'lower-alpha',
        listStylePosition: 'outside',
    },
    ol4: {
        padding: 0,
        margin: 0,
        listStyleType: 'upper-roman',
        listStylePosition: 'outside',
    },
    ol5: {
        padding: 0,
        margin: 0,
        listStyleType: 'lower-roman',
        listStylePosition: 'outside',
    },

    // Unordered list
    ul: {
        padding: 0,
        margin: 0,
        listStylePosition: 'outside',
    },

    // Regular list item
    listItem: {
        margin: '0 32px',
        fontFamily: 'var(--listitem-marker-font-family)',
        fontSize: 'var(--listitem-marker-font-size)',
        backgroundColor: 'var(--listitem-marker-background-color)',
        '::marker': {
            color: 'var(--listitem-marker-color)',
            backgroundColor: 'var(--listitem-marker-background-color)',
            fontFamily: 'var(--listitem-marker-font-family)',
            fontSize: 'var(--listitem-marker-font-size)',
        },
    },

    // Base checklist item
    checklistItemBase: {
        position: 'relative',
        marginLeft: '0.5em',
        marginRight: '0.5em',
        paddingLeft: '1.5em',
        paddingRight: '1.5em',
        listStyleType: 'none',
        outline: 'none',
        display: 'block',
        minHeight: '1.5em',
        '::before': {
            content: '"\\200B"',
            width: '0.9em',
            height: '0.9em',
            top: '50%',
            left: 0,
            cursor: 'pointer',
            display: 'block',
            backgroundSize: 'cover',
            position: 'absolute',
            transform: 'translateY(-50%)',
        },
        ':focus::before': {
            boxShadow: '0 0 0 2px #a6cdfe',
            borderRadius: '2px',
        },
    },

    // Unchecked checklist item
    listItemUnchecked: {
        '::before': {
            borderWidth: '1px',
            borderRadius: '2px',
            borderStyle: 'solid',
            borderColor: '#999'
        },
    },

    // Checked checklist item
    listItemChecked: {
        textDecoration: 'line-through',
        '::before': {
            borderRadius: '2px',
            backgroundColor: '#3d87f5',
            backgroundRepeat: 'no-repeat',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgb(61, 135, 245)'
        },
        '::after': {
            content: '""',
            cursor: 'pointer',
            borderColor: '#fff',
            borderStyle: 'solid',
            position: 'absolute',
            display: 'block',
            top: '45%',
            width: '0.2em',
            left: '0.35em',
            height: '0.4em',
            transform: 'translateY(-50%) rotate(45deg)',
            borderWidth: '0 0.1em 0.1em 0',
        },
    },

    // Nested list item (no marker)
    nestedListItem: {
        listStyleType: 'none',
        '::before': {
            display: 'none',
        },
        '::after': {
            display: 'none',
        },
    },

    quote: {
        margin: '0',
        marginLeft: '20px',
        marginBottom: '10px',
        fontSize: '15px',
        color: 'rgb(101, 103, 107)',
        borderLeftColor: 'rgb(206, 208, 212)',
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
        paddingLeft: '16px',
    }

});