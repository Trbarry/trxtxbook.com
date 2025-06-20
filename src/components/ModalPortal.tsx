import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById('modal-root');
    if (!element) {
      element = document.createElement('div');
      element.id = 'modal-root';
      document.body.appendChild(element);
    }
    setModalRoot(element);

    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  if (!modalRoot) return null;
  return createPortal(children, modalRoot);
};