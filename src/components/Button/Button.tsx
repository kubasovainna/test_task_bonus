import clsx from 'clsx';
import React from 'react';

import styles from './Button.module.scss';

type Props = {
  caption?: string;
  className?: string;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<Props> = ({ caption, disabled = false, className, ...props }) => {
  const buttonClassName = clsx(styles.button, className);

  return (
    <button className={buttonClassName} disabled={disabled} {...props}>
      {caption}
    </button>
  );
};
