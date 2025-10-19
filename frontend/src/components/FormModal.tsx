import { Button, LoadingSpinner } from "./primary";
import type { FormModalProps } from "../types/modal";

const FormModal = ({
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: FormModalProps) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Content */}
      <div>{children}</div>

      {/* Form Actions */}
      <div className="flex space-x-3 justify-end pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {cancelText}
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Submitting...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormModal;
