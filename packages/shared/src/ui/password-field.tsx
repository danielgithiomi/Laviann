'use client';
import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from 'react';
import { Icon } from './primitives';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> & { label: string; hint?: string };

/** Password input that starts hidden, with an accessible show/hide toggle placed outside the label. */
export function PasswordField({ label, hint, ...props }: PasswordFieldProps) {
    const id = useId();
    const hintId = `${id}-hint`;
    const input = useRef<HTMLInputElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        // Re-hide on submit so the typed password is not left on screen.
        const form = input.current?.form;
        if (!form) return;
        const hide = () => setVisible(false);
        form.addEventListener('submit', hide);
        return () => form.removeEventListener('submit', hide);
    }, []);
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <div className="password-control">
                <input
                    {...props}
                    ref={input}
                    id={id}
                    type={visible ? 'text' : 'password'}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-describedby={hint ? hintId : undefined}
                />
                <button
                    type="button"
                    className="password-toggle"
                    aria-label="Show password"
                    aria-pressed={visible}
                    aria-controls={id}
                    title={visible ? 'Hide password' : 'Show password'}
                    onClick={() => setVisible(v => !v)}
                >
                    <Icon name={visible ? 'eye-off' : 'eye'} size={20} />
                </button>
            </div>
            {hint && <small id={hintId}>{hint}</small>}
        </div>
    );
}
