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

  fetchData().then((result) => {
    setData([...result]);
  });

  //Высота по умолчанию для 1 элемента
  const offset = 35;
  //Показывает запущен ли барабан
  const [isActive, setIsActive] = useState(false);
  //Текущий индекс элемента, который находится в рамке (необходимо для изменения translate)
  const [currentIndex, setCurrentIndex] = useState(0);
  //Данные вариантов призов от сервера
  const [data, setData] = useState<Variant[]>([]);
  //Вариант, который является победителем (генерируется рандомно)
  const [isWinnerVariantData, setIsWinnerVariantData] = useState<Variant | null>();

  const rollTimeout = useRef<NodeJS.Timeout>();
  const rollInterval = useRef<NodeJS.Timeout>();

  const variantsWrapperStyleReset = {
    transition: `transform linear 1ms 0s`,
    transform: 'none',
  };
  const variantsWrapperStyle = {
    transition: `transform linear ${speed / 10}ms 0s`,
    transform: 'translateY(-' + currentIndex * offset + 'px)',
  };
  const roll = async () => {
    setCurrentIndex((prevState) => prevState + 1);
  };

  const buttonHandler = () => {
    setIsWinnerVariantData(null);
    setIsActive(true);
    if (rollTimeout.current) {
      clearTimeout(rollTimeout.current);
    }
    rollTimeout.current = setTimeout(async () => {
      setIsActive(false);
      const resultIndex = 1 + Math.floor(Math.random() * data!.length);
      const winnerEl = await data?.filter((el) => el.id === resultIndex)[0];
      setIsWinnerVariantData(winnerEl);
      setCurrentIndex(resultIndex - 1);
      if (winnerEl) {
        console.log('Отправка результата на сервер...');
        await fetch('http://localhost:8080/save-variant', {
          method: 'POST',
          body: `${isWinnerVariantData?.title}`,
        }).then((res) => {
          if (!res.ok) {
            console.log('Failed to fetch data');
          } else {
            console.log('Статус ответа:' + res.status);
          }
        });
      }
    }, timer);
  };

  //Если барабан запущен, то вызывается функция roll(),
  //которая сдвигает список на 1 элемент вверх каждый заданный интервал времени
  useEffect(() => {
    if (isActive) {
      if (currentIndex === data.length) {
        setCurrentIndex((prev) => prev + 1);
        setTimeout(() => {
          setCurrentIndex(0);
        }, speed / 10);
      } else {
        rollInterval.current = setInterval(() => {
          roll();
        }, speed);
        return () => clearInterval(rollInterval.current);
      }
    }
  }, [isActive, currentIndex]);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Испытайте свою удачу</h1>
      <div className={styles.content}>
        {data.length > 0 && (
          <div className={styles.data}>
            <div
              className={clsx(styles.variantsWrapper)}
              style={currentIndex < data!.length ? variantsWrapperStyle : variantsWrapperStyleReset}
            >
              {/*Визуально для пользователя отображаем массив с дополнительными элементами в начале и конце,
              чтобы был эффект непрерывной прокрутки и бесконечности списка*/}

              {[data[data.length - 1], ...data, data[0], data[1]].map((v, index) => (
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
