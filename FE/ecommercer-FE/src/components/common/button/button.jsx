import { isDisabled } from '@testing-library/user-event/dist/utils';
import './button.scss';
import classNames from 'classnames';

function Button({
  text = 'Text',
  className = '',
  btnType = 'button',
  onClick,
  isDisabled = false,
  chidren,
}) {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      type={btnType}
      className={classNames('button', { disabled: isDisabled }, className)}
    >
      {text}
      {chidren}
    </button>
  );
}

export default Button;
