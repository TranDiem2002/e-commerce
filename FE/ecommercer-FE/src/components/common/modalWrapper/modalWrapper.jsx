import CloseSvg from '../../../assets/svg/closeSvg';
import './modalWrapper.scss';

const ModalWrapper = ({ children, onClose }) => {
  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <div className='modal-wrapper'>
      <div className='modal__close' onClick={() => handleClose()}>
        <CloseSvg />
      </div>
      <div className='modal-container'>{children}</div>
    </div>
  );
};

export default ModalWrapper;
