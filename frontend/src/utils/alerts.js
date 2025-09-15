import Swal from 'sweetalert2';

// Success messages will be centered
const defaultSuccessConfig = {
  position: 'center',
  showConfirmButton: true,
  timer: 3000,
  timerProgressBar: true,
  confirmButtonColor: '#3b82f6'
};

// Warning messages configuration
const defaultWarningConfig = {
  position: 'center',
  showCancelButton: true,
  confirmButtonColor: '#f59e0b',
  cancelButtonColor: '#9ca3af',
  confirmButtonText: 'Yes, continue',
  cancelButtonText: 'Cancel',
  reverseButtons: true
};

export const showSuccess = (title, message) => {
  return Swal.fire({
    icon: 'success',
    title: title || 'Success!',
    text: message,
    ...defaultSuccessConfig
  });
};

export const showWarning = (title, message, confirmText = 'Continue') => {
  return Swal.fire({
    icon: 'warning',
    title: title || 'Are you sure?',
    text: message,
    ...defaultWarningConfig,
    confirmButtonText: confirmText
  });
};

export const showError = (title, message) => {
  return Swal.fire({
    icon: 'error',
    title: title || 'Error!',
    text: message,
    position: 'center',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
    allowOutsideClick: false
  });
};

export const showConfirm = (title, text, confirmButtonText = 'Confirm') => {
  return Swal.fire({
    title: title || 'Are you sure?',
    text: text || "You won't be able to revert this!",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusConfirm: false,
    focusCancel: true
  });
};

export const showLoading = (title = 'Loading...') => {
  Swal.fire({
    title: title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeLoading = () => {
  Swal.close();
};
