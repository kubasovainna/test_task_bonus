import React from 'react';

import styles from './Wrapper.module.scss';
import { Button } from '@/components/Button/Button';

export interface LayoutProps {
  children?: React.ReactNode;
}

export const Wrapper: React.FC<LayoutProps> = ({ children }) => (
  <div className={styles.wrapper}>
    <h1 className={styles.title}>Испытайте свою удачу</h1>
    <div className={styles.resultVariantWrapper}></div>
    <Button caption={'Мне повезёт!'} />
  </div>
);
