import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  timer?: number;
}

export const Widget: React.FC<WidgetProps> = ({ children, speed = 1000, timer = 3000 }) => {
  const fetchData = useCallback(async () => {
    const res = await fetch('http://localhost:8080/get-variants');
    if (!res.ok) {
      console.log('Failed to fetch data');
    }
    return res.json();
  }, []);

  //Высота по умолчанию для 1 элемента
  const offset = 35;
  //Показывает запущен ли барабан
  const [isActive, setIsActive] = useState(false);
  //Текущий индекс элемента, который находится в рамке (необходимо для изменения translate)
  const [currentIndex, setCurrentIndex] = useState(0);
  //Данные вариантов призов от сервера
  const [data, setData] = useState<Variant[]>([]);
  //Вариант, который является победителем (генерируется рандомно)
  const [isWinnerVariantData, setIsWinnerVariantData] = useState<Variant>();

  const rollTimeout = useRef<NodeJS.Timeout>();
  const rollInterval = useRef<NodeJS.Timeout>();

  const variantsWrapperStyle =
    currentIndex <= data!.length && currentIndex !== 0
      ? {
          transition: `transform linear 0.1s`,
          transform: 'translateY(-' + currentIndex * offset + 'px)',
        }
      : currentIndex === 1
      ? {
          transition: `transform 0s`,
          transform: 'translateY(-' + (currentIndex + 1) * offset + 'px)',
        }
      : {
          transition: `transform 0s`,
          transform: 'translateY(-' + currentIndex * offset + 'px)',
        };

  const roll = () => {
    if (currentIndex < data!.length) {
      setCurrentIndex((prevState) => prevState + 1);
    } else {
      setCurrentIndex(0);
    }
    setTimeout(console.log('currentindex[' + currentIndex + `]-${currentIndex + 1} id`));
  };

  const buttonHandler = () => {
    setIsWinnerVariantData(null);
    setIsActive(true);
    if (rollTimeout.current) {
      clearTimeout(rollTimeout.current);
    }
    rollTimeout.current = setTimeout(async () => {
      // setIsActive(false);
      const resultIndex = 1 + Math.floor(Math.random() * data!.length);
      setTimeout(console.log(resultIndex));
      const winnerEl = await data?.filter((el) => el.id === resultIndex)[0];
      console.log(winnerEl);
      setIsWinnerVariantData(winnerEl);
      // setCurrentIndex(resultIndex - 1);
    }, timer);
  };

  //Если барабан запущен, то вызывается функция roll(),
  //которая сдвигает список на 1 элемент вверх каждый заданный интервал времени
  useEffect(() => {
    if (isActive) {
      console.log(currentIndex);
      if (currentIndex === 0) {
        setTimeout(() => setCurrentIndex((prev) => prev + 1));
      } else {
        rollInterval.current = setInterval(() => {
          console.log(currentIndex);
          roll();
        }, speed);
      }

      return () => clearInterval(rollInterval.current);
    }
  }, [isActive, currentIndex]);

  useEffect(() => {
    fetchData().then((result) => {
      setData([...result]);
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Испытайте свою удачу</h1>
      <div className={styles.content}>
        {data.length > 0 && (
          <div className={styles.data}>
            <div className={clsx(styles.variantsWrapper)} style={variantsWrapperStyle}>
              {/*Визуально для пользователя отображаем массив с дополнительными элементами в начале и конце,
              чтобы был эффект непрерывной прокрутки и бесконечности списка*/}

              {[data[data.length - 1], ...data, data[0], data[1]].map((v, index) => (
                <div
                  key={`${v.id}${index}`}
                  className={clsx(styles.variantItem, { [styles.bonus]: v.isBonus })}
                >
                  {v?.isBonus !== true
                    ? `${v.id - 1}: ${v.title.split(' ').slice(0, 5).join(' ')}...`
                    : v.title}
                </div>
              ))}
            </div>
            <div className={styles.bgOpacity} />
            <div className={styles.resultVariantWrapper}></div>
          </div>
        )}
        {(!data || data.length === 0) && <div className={styles.loader} />}
      </div>
      {isWinnerVariantData && (
        <div
          className={clsx(styles.resultVariant, { [styles.bonus]: isWinnerVariantData.isBonus })}
        >
          {isWinnerVariantData.title}
        </div>
      )}
      <Button
        disabled={!data || isActive ? true : false}
        className={styles.btn}
        onClick={() => buttonHandler()}
        caption={'Мне повезёт!'}
      />
    </div>
  );
};
