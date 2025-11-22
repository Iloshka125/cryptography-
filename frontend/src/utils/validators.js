const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+?\d{10,15}$/;

export const isEmail = (value = '') => emailRegex.test(value.trim());

export const isPhone = (value = '') =>
  phoneRegex.test(value.replace(/\s+/g, ''));

export const validateIdentifier = (value) => {
  if (!value.trim()) {
    return 'Введите почту или телефон';
  }
  if (!isEmail(value) && !isPhone(value)) {
    return 'Некорректный формат';
  }
  return undefined;
};

export const validatePassword = (value = '') => {
  if (!value.trim()) {
    return 'Введите пароль';
  }
  if (value.trim().length < 6) {
    return 'Минимум 6 символов';
  }
  return undefined;
};

export const validateNickname = (value = '') => {
  if (!value.trim()) {
    return 'Введите никнейм';
  }
  if (value.trim().length < 3) {
    return 'Минимум 3 символа';
  }
  return undefined;
};

export const validateEmailOptional = (value = '', values) => {
  if (!value && !values.phone) {
    return 'Укажите почту или телефон';
  }
  if (value && !isEmail(value)) {
    return 'Некорректная почта';
  }
  return undefined;
};

export const validatePhoneOptional = (value = '', values) => {
  if (!value && !values.email) {
    return 'Укажите почту или телефон';
  }
  if (value && !isPhone(value)) {
    return 'Некорректный телефон';
  }
  return undefined;
};

export const validatePasswordConfirmation = (value = '', values) => {
  if (!value.trim()) {
    return 'Повторите пароль';
  }
  if (value !== values.password) {
    return 'Пароли не совпадают';
  }
  return undefined;
};

