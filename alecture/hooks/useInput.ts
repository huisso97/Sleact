import React, { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from 'react';

// 타입을 변수로 따로 빼서 가독성을 높인다.
// type Handler = (e: any) => void;
type Handler = (e: ChangeEvent<HTMLInputElement>) => void;
type ReturnTypes<T = any> = [T, Handler, Dispatch<SetStateAction<T>>];

// generic type으로 매개변수와 리턴값에 대한 타입을 정의한다
// 매개변수에 대한 타입이 지정되면 그에 맞춰 리턴값도 타입이 정의되어지는 장점이 있다.
// any의 경우, 매개변수와 리턴값의 타입을 똑같이 맞출 수 없기 때문에, 제너릭 타입을 권장한다.
// 여기서는 initialData와 value의 타입이 같다
export const useInput = <T = string | number>(initialData: T): ReturnTypes => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as unknown as T);
  }, []);

  return [value, handler, setValue];
};
