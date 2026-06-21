import Button from './common/Button';
import Flex from './common/Flex';
import Typo from './common/Typo';
import ModalLayout from './modal/ModalLayout';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <ModalLayout>
      <Flex direction="column" gap={16}>
        <Flex direction="column" gap={8}>
          <Typo as="h2" weight="bold">
            {title}
          </Typo>
          <Typo size="s">{description}</Typo>
        </Flex>

        <Flex justifyContent="flex-end" gap={8}>
          <Button onClick={onCancel}>{cancelText}</Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </Flex>
      </Flex>
    </ModalLayout>
  );
}
