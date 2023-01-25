import React, { useEffect, useRef, useState } from 'react';

import styles from './Widget.module.scss';
import { Button } from '@/components/Button/Button';
import clsx from 'clsx';

type Variant = {
  id: number;
  title: string;
  isBonus?: boolean;
};

export interface WidgetProps {
  children?: React.ReactNode;
  speed?: number;
}

export const Widget: React.FC<WidgetProps> = ({ children, speed = 1000 }) => {
  const fetchData = async () => {
    const res = await fetch('http://localhost:8080/get-variants');
    if (!res.ok) {
      console.log('Failed to fetch data');
    }
    return res.json();
  };
  const offset = 35;
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState<Variant[]>();
  const [isWinnerVariant, setIsWinnerVariant] = useState<Variant | null>();
  const scrollTimeout = useRef<NodeJS.Timeout>();

  const roll = async () => {
    if (!(currentIndex > data!.length)) {
      setCurrentIndex((prevState) => prevState + 0.1);
    } else {
      setCurrentIndex(0.2);
    }
  };
  const buttonHandler = async () => {
    setCurrentIndex(0);
    setIsWinnerVariant(null);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    const variantIndex = Math.floor(Math.random() * data!.map((v) => v.id).length);
    setIsActive(true);
    scrollTimeout.current = setTimeout(() => {
      setIsWinnerVariant(data!.find((v) => v.id === variantIndex + 1));
      setIsActive(false);
      setCurrentIndex(variantIndex - 1);
    }, 6000);
  };

  useEffect(() => {
    fetchData().then((result) => {
      setData([...result]);
    });
  }, []);

  useEffect(() => {
    if (data) {
      console.log(data);
      console.log(data.length);
      console.log(data[data.length - 1]);
    }
  }, [data]);

  useEffect(() => {
    if (isActive) {
      console.log(currentIndex);
      const rollInterval = setInterval(async () => {
        roll();
      }, speed / 10);
      return () => clearInterval(rollInterval);
    }
  }, [currentIndex, isActive]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Испытайте свою удачу</h1>
      <div className={styles.content}>
        {data && (
          <div className={styles.data}>
            <div
              className={clsx(styles.variantsWrapper)}
              style={
                currentIndex < data!.length
                  ? {
                      transition: `transform linear none`,
                      transform: 'translateY(-' + currentIndex * offset + 'px)',
                    }
                  : {
                      transition: 'transform  none',
                      transform: 'none',
                    }
              }
            >
              {[...data, data[0], data[1], data[2]].map((v, index) => (
                <div
                  key={`${v.id}${index}`}
                  className={clsx(styles.variantItem, { [styles.bonus]: v.isBonus })}
                >
                  {v?.isBonus !== true ? `${v.title.split(' ').slice(0, 5).join(' ')}...` : v.title}
                </div>
              ))}
            </div>
            <div className={styles.bgOpacity} />
            <div className={styles.resultVariantWrapper}></div>
          </div>
        )}
        {!data && <div className={styles.loader} />}
      </div>
      {isWinnerVariant && (
        <div className={clsx(styles.resultVariant, { [styles.bonus]: isWinnerVariant.isBonus })}>
          {isWinnerVariant.title}
        </div>
      )}
      <Button
        disabled={!data ? true : false}
        className={styles.btn}
        onClick={buttonHandler}
        caption={'Мне повезёт!'}
      />
    </div>
  );
};
