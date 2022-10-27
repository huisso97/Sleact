import React, { CSSProperties, FC, useCallback } from 'react';
import { Style } from 'util';
import { CloseModalButton, CreateMenu } from './styles';

interface MenuProps {
  show: boolean;
  style: CSSProperties;
  onCloseModal: (e: any) => void;
  closeButton?: boolean;
}

const Menu: FC<MenuProps> = ({ children, style, show, onCloseModal, closeButton }) => {
  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;
  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children}
      </div>
    </CreateMenu>
  );
};

// 부모요소에 closeButton 따로 안넣어줘도 항상 true로 설정해줌
Menu.defaultProps = {
  closeButton: true,
};
export default Menu;
