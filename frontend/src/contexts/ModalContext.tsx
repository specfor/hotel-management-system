import { createContext, useReducer, useCallback } from "react";
import type { ReactNode } from "react";
import type { ModalItem, ModalContextType } from "../types/modal";

// Modal state interface
interface ModalState {
  modals: ModalItem[];
}

// Modal actions
type ModalAction =
  | { type: "OPEN_MODAL"; payload: ModalItem }
  | { type: "CLOSE_MODAL"; payload: { id: string } }
  | { type: "CLOSE_ALL_MODALS" }
  | { type: "UPDATE_MODAL"; payload: { id: string; updates: Partial<ModalItem> } };

// Initial state
const initialState: ModalState = {
  modals: [],
};

// Modal reducer
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        ...state,
        modals: [...state.modals, action.payload],
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        modals: state.modals.filter((modal) => modal.id !== action.payload.id),
      };
    case "CLOSE_ALL_MODALS":
      return {
        ...state,
        modals: [],
      };
    case "UPDATE_MODAL":
      return {
        ...state,
        modals: state.modals.map((modal) =>
          modal.id === action.payload.id ? { ...modal, ...action.payload.updates } : modal
        ),
      };
    default:
      return state;
  }
}

// Create context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Modal provider props
interface ModalProviderProps {
  children: ReactNode;
}

// Modal provider component
export function ModalProvider({ children }: ModalProviderProps) {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  // Generate unique ID for modals
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Open modal function
  const openModal = useCallback(
    (modal: Omit<ModalItem, "id">): string => {
      const id = generateId();
      const modalWithId: ModalItem = { ...modal, id };
      dispatch({ type: "OPEN_MODAL", payload: modalWithId });
      return id;
    },
    [generateId]
  );

  // Close modal function
  const closeModal = useCallback(
    (id: string) => {
      const modal = state.modals.find((m) => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      dispatch({ type: "CLOSE_MODAL", payload: { id } });
    },
    [state.modals]
  );

  // Close all modals function
  const closeAllModals = useCallback(() => {
    // Call onClose for all modals
    state.modals.forEach((modal) => {
      if (modal.onClose) {
        modal.onClose();
      }
    });
    dispatch({ type: "CLOSE_ALL_MODALS" });
  }, [state.modals]);

  // Update modal function
  const updateModal = useCallback((id: string, updates: Partial<ModalItem>) => {
    dispatch({ type: "UPDATE_MODAL", payload: { id, updates } });
  }, []);

  // Context value
  const value: ModalContextType = {
    modals: state.modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export default ModalContext;
