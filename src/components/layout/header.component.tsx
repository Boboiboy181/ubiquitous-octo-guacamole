import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';

const styles = stylex.create({
    header: {
        backgroundColor: '#fff',
        color: 'black',
        textAlign: 'left',
        padding: '20px 30px',
        // borderBottom: '1px solid #eee',
        // boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    h1: {
        fontSize: '20px',
        margin: '0',
        fontWeight: '500',
        color: '#087EA4',
    },
    link: {
        textDecoration: 'none',
        color: '#000',
    },
    activeLink: {
        color: '#087EA4', // Example: Change color for active state
        fontWeight: 'bold', // Example: Make it bold
        textDecoration: 'underline', // Example: Add underline
    },
    linkContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
});

export const Header = () => {
    return (
        <header {...stylex.props(styles.header)}>
            <h1 {...stylex.props(styles.h1)}>Draft</h1>
            <div {...stylex.props(styles.linkContainer)}>
                <Link
                    to="/"
                    {...stylex.props(styles.link)}
                    activeProps={{
                        className: stylex.props(styles.activeLink).className,
                    }}
                    activeOptions={{ exact: true }}
                >
                    Home
                </Link>{' '}
                <Link
                    to="/lexical"
                    {...stylex.props(styles.link)}
                    activeProps={{
                        className: stylex.props(styles.activeLink).className,
                    }}
                >
                    Lexical
                </Link>
                <Link
                    to="/threejs"
                    {...stylex.props(styles.link)}
                    activeProps={{
                        className: stylex.props(styles.activeLink).className,
                    }}
                >
                    Three.js
                </Link>
            </div>
        </header>
    );
};
