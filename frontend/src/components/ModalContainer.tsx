import { useModal } from "../hooks/useModal";
import Modal from "./Modal";

const ModalContainer = () => {
  const { modals, closeModal } = useModal();

  return (
    <>
      {modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
          title={modal.title}
          size={modal.size}
          closeOnBackdropClick={modal.closeOnBackdropClick}
          closeOnEscape={modal.closeOnEscape}
          showCloseButton={modal.showCloseButton}
          className={modal.className}
          footer={modal.footer}
        >
          {modal.component}
        </Modal>
      ))}
    </>
  );
};

export default ModalContainer;
