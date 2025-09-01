import * as stylex from '@stylexjs/stylex';
import { IconChevronDown } from '@tabler/icons-react';
import { isDOMNode } from 'lexical';
import {
    createContext,
    type KeyboardEvent,
    type ReactNode,
    type RefObject,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

const dropdown_padding = 8;

const styles = stylex.create({
    dropdown: {
        position: 'fixed',
        zIndex: 1000,
        backgroundColor: '#fff',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: '#eee',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: dropdown_padding,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        maxHeight: 6 * 34,
        overflowY: 'auto',
    },
    item: {
        padding: '8px 12px',
        borderWidth: '0',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#f0f0f0',
        },
        ':focus': {
            backgroundColor: '#f0f0f0',
        },
        backgroundColor: '#fff',
        borderRadius: '6px',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: '140px',
    },
    itemActive: {
        backgroundColor: '#f0f0f0',
    },
    trigger: {
        borderWidth: '0',
        backgroundColor: '#fff',
        cursor: 'pointer',
        height: '36px',
        padding: '0 12px',
        borderRadius: '8px',
        ':hover': {
            backgroundColor: '#f0f0f0',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
    },
    triggerLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
});

export const Dropdown = ({
    children,
    label,
    stopOnClickSelf,
    buttonIcon,
    triggerWidth,
}: {
    children: ReactNode;
    label: string | ReactNode;
    stopOnClickSelf?: boolean;
    buttonIcon?: ReactNode;
    triggerWidth?: number;
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleClose = () => {
        setShowDropdown(false);
        if (buttonRef.current) {
            buttonRef.current.focus();
        }
    };

    const handleOpen = () => {
        setShowDropdown(true);
    };

    useEffect(() => {
        const button = buttonRef.current;
        const dropdown = dropdownRef.current;

        if (showDropdown && button && dropdown) {
            const { top, left } = button.getBoundingClientRect();
            dropdown.style.top = `${top + button.offsetHeight + dropdown_padding}px`;
            dropdown.style.left = `${Math.min(left, window.innerWidth - dropdown.offsetWidth - 20)}px`;
        }
    }, [showDropdown]);

    useEffect(() => {
        const button = buttonRef.current;

        if (button && showDropdown) {
            const handle = (event: MouseEvent) => {
                const target = event.target as Node;
                if (!isDOMNode(target)) return;
                if (stopOnClickSelf) {
                    if (dropdownRef?.current?.contains(target)) {
                        return;
                    }
                }
                if (!button.contains(target)) {
                    setShowDropdown(false);
                }
            };
            document.addEventListener('click', handle);

            return () => {
                document.removeEventListener('click', handle);
            };
        }
    }, [showDropdown, stopOnClickSelf]);

    return (
        <>
            <button
                type="button"
                ref={buttonRef}
                onClick={handleOpen}
                {...stylex.props(styles.trigger)}
                style={{
                    width: triggerWidth,
                    minWidth: triggerWidth,
                }}
            >
                <span {...stylex.props(styles.triggerLabel)}>
                    {buttonIcon && buttonIcon}
                    {label && label}
                </span>
                <IconChevronDown size={16} />
            </button>
            {showDropdown &&
                createPortal(
                    <DropdownList
                        onClose={handleClose}
                        dropdownRef={dropdownRef}
                        className={stylex.props(styles.dropdown).className}
                    >
                        {children}
                    </DropdownList>,
                    document.body,
                )}
        </>
    );
};

interface DropdownContextType {
    registerItem: (ref: RefObject<HTMLButtonElement | null>) => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export const DropdownItem = ({
    children,
    onClick,
    isActive,
}: {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    title?: string;
    isActive?: boolean;
}) => {
    const ref = useRef<HTMLButtonElement>(null);

    const dropdownContext = useContext(DropdownContext);

    if (!dropdownContext) {
        throw new Error('DropdownItem must be used within a Dropdown');
    }

    const { registerItem } = dropdownContext;

    useEffect(() => {
        if (ref.current) {
            registerItem(ref);
        }
    }, [registerItem]);

    return (
        <button ref={ref} type="button" {...stylex.props(styles.item, isActive && styles.itemActive)} onClick={onClick}>
            {children}
        </button>
    );
};

function DropdownList({
    children,
    onClose,
    dropdownRef,
    className,
}: {
    children: ReactNode;
    onClose: () => void;
    dropdownRef: RefObject<HTMLDivElement | null>;
    className?: string;
}) {
    const [items, setItems] = useState<RefObject<HTMLButtonElement | null>[]>([]);
    const [highlightedItem, setHighlightedItem] = useState<RefObject<HTMLButtonElement | null>>();

    const registerItem = useCallback((ref: RefObject<HTMLButtonElement | null>) => {
        setItems((prev) => (prev ? [...prev, ref] : [ref]));
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!items) return;

        const key = event.key;

        if (['Escape', 'ArrowUp', 'ArrowDown'].includes(key)) {
            event.preventDefault();
        }

        if (key === 'Escape') {
            onClose();
        } else if (key === 'ArrowUp') {
            setHighlightedItem((prev) => {
                if (!prev) return items[0];
                const index = items.indexOf(prev) - 1;
                return items[index === -1 ? items.length - 1 : index];
            });
        } else if (key === 'ArrowDown') {
            setHighlightedItem((prev) => {
                if (!prev) return items[0];
                const index = items.indexOf(prev) + 1;
                return items[index === items.length ? 0 : index];
            });
        }
    };

    const contextValue = useMemo(() => ({ registerItem }), [registerItem]);

    useEffect(() => {
        if (items && !highlightedItem) {
            setHighlightedItem(items[0]);
        }

        if (highlightedItem?.current) {
            highlightedItem.current.focus();
        }
    }, [items, highlightedItem]);

    return (
        <DropdownContext.Provider value={contextValue}>
            <div ref={dropdownRef} onKeyDown={handleKeyDown} className={className}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
}
