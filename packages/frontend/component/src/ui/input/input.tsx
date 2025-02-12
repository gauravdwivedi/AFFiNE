import clsx from 'clsx';
import type {
  ChangeEvent,
  CSSProperties,
  ForwardedRef,
  InputHTMLAttributes,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { input, inputWrapper } from './style.css';

export type InputProps = {
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (ev: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  autoSelect?: boolean;
  noBorder?: boolean;
  status?: 'error' | 'success' | 'warning' | 'default';
  size?: 'default' | 'large' | 'extraLarge';
  preFix?: ReactNode;
  endFix?: ReactNode;
  type?: HTMLInputElement['type'];
  inputStyle?: CSSProperties;
  onEnter?: () => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'onBlur'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    disabled,
    onChange: propsOnChange,
    noBorder = false,
    className,
    status = 'default',
    style = {},
    inputStyle = {},
    size = 'default',
    preFix,
    endFix,
    onEnter,
    onKeyDown,
    onBlur,
    autoFocus,
    autoSelect,
    ...otherProps
  }: InputProps,
  upstreamRef: ForwardedRef<HTMLInputElement>
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useLayoutEffect(() => {
    if (inputRef.current && (autoFocus || autoSelect)) {
      inputRef.current?.focus();
      if (autoSelect) {
        inputRef.current?.select();
      }
    }
  }, [autoFocus, autoSelect, upstreamRef]);

  // use native blur event to get event after unmount
  // don't use useLayoutEffect here, because the cleanup function will be called before unmount
  useEffect(() => {
    if (!onBlur) return;
    inputRef.current?.addEventListener('blur', onBlur as any);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      inputRef.current?.removeEventListener('blur', onBlur as any);
    };
  }, [onBlur]);

  return (
    <div
      className={clsx(inputWrapper, className, {
        // status
        disabled: disabled,
        'no-border': noBorder,
        // color
        error: status === 'error',
        success: status === 'success',
        warning: status === 'warning',
        default: status === 'default',
        // size
        large: size === 'large',
        'extra-large': size === 'extraLarge',
      })}
      style={{
        ...style,
      }}
    >
      {preFix}
      <input
        className={clsx(input, {
          large: size === 'large',
          'extra-large': size === 'extraLarge',
        })}
        ref={ref => {
          inputRef.current = ref;
          if (upstreamRef) {
            if (typeof upstreamRef === 'function') {
              upstreamRef(ref);
            } else {
              upstreamRef.current = ref;
            }
          }
        }}
        disabled={disabled}
        style={inputStyle}
        onChange={useCallback(
          (e: ChangeEvent<HTMLInputElement>) => {
            propsOnChange?.(e.target.value);
          },
          [propsOnChange]
        )}
        onKeyDown={useCallback(
          (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              onEnter?.();
            }
            onKeyDown?.(e);
          },
          [onKeyDown, onEnter]
        )}
        {...otherProps}
      />
      {endFix}
    </div>
  );
});
