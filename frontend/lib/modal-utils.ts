// Utility functions for managing modal session storage

export const ModalUtils = {
  // Check if a modal has been seen in this session
  hasSeenModal: (modalKey: string): boolean => {
    if (typeof window === 'undefined') return false
    return !!sessionStorage.getItem(modalKey)
  },

  // Mark a modal as seen
  markModalAsSeen: (modalKey: string): void => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(modalKey, 'true')
  },

  // Clear all modal session storage (useful for testing)
  clearAllModalStorage: (): void => {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem('dob-welcome-modal-seen')
    sessionStorage.removeItem('dob-success-modal-seen')
  },

  // Clear specific modal storage
  clearModalStorage: (modalKey: string): void => {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(modalKey)
  },

  // Get all modal keys
  getModalKeys: (): string[] => {
    return ['dob-welcome-modal-seen', 'dob-success-modal-seen']
  }
}

// Modal keys for consistency
export const MODAL_KEYS = {
  WELCOME: 'dob-welcome-modal-seen',
  SUCCESS: 'dob-success-modal-seen'
} as const 