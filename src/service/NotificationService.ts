import {toast} from "react-toastify";
import {Theme, UserTheme} from "../UserContext";

export class NotificationService {

  private static getEffectiveTheme = (): Theme => {
    let userTheme: UserTheme | null = localStorage.getItem('theme') as UserTheme;
    if (!userTheme) {
      userTheme = 'system';
    }
    if (userTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return userTheme;
  };

  static handleUnexpectedError(err: Error = new Error(), title: string = '', toastId?: string) {
    const messagePrefix = title ? `${title}: ` : 'Unexpected error: ';
    const message = `${messagePrefix}${err.message || 'No error message provided'}`;

    toast.error(message, {
      toastId: toastId || 'error',
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: NotificationService.getEffectiveTheme(),
    });
  }

  static handleError(title: string = '', toastId?: string) {
    toast.error(title, {
      toastId: toastId || 'error',
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: NotificationService.getEffectiveTheme(),
    });
  }

  static handleSuccess(title: string, toastId?: string) {
    toast.success(title, {
      toastId: toastId || 'success',
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: NotificationService.getEffectiveTheme(),
    });
  }
}
