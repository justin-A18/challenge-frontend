import type { PropsWithChildren } from "react";
export type AppDialogProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;
