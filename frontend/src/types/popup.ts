export interface PopupContent {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface PopupContextType {
  showPopup: (content: PopupContent) => void;
  hidePopup: () => void;
  popup: PopupContent | null;
  isVisible: boolean;
} 