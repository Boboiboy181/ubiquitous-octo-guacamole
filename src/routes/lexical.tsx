import * as stylex from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';
import { LexicalEditor } from '~/components/ui';

export const Route = createFileRoute('/lexical')({
    component: LexicalRoute,
});

const styles = stylex.create({
    container: {
        backgroundColor: '#f2f3f4',
        height: '100%',
    },
    editor: {
        position: 'relative',
        margin: '0 auto',
        borderRadius: '8px',
        width: '1100px'
    },
});

function LexicalRoute() {
    return (
        <div {...stylex.props(styles.container)}>
            <div {...stylex.props(styles.editor)}>
                <h2>Lexical Editor</h2>
                <LexicalEditor />
            </div>
        </div>
    );
}
