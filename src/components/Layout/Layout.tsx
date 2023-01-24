import React from 'react';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className={styles.wrapper}>{children}</div>
);
