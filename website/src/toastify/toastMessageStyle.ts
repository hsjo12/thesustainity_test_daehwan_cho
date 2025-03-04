import { toast, ToastPosition, Id } from "react-toastify";
import { TransactionResponse } from "ethers";

const toastVisibility = new Set();

export function toastMessage(
  message: string,
  type: string,
  time: number = 2000
): Id | undefined {
  const options = {
    position: "top-center" as ToastPosition,
    autoClose: time,
    onClose: () => {
      toastVisibility.delete(`${type}-${message}`);
    },
  };

  const toastKey = `${type}-${message}`;
  if (type !== "dismiss" && toastVisibility.has(toastKey)) return;
  toastVisibility.add(toastKey);

  let toastId: Id | undefined;

  if (type === "success") {
    toastId = toast.success(message, options);
  } else if (type === "error") {
    toastVisibility.clear();
    toast.dismiss();
    toastId = toast.error(message, options);
  } else if (type === "info") {
    toastId = toast.info(message, options);
  } else if (type === "warn") {
    toastId = toast.warn(message, options);
  } else if (type === "dismiss") {
    toast.dismiss(message);
  } else {
    toastVisibility.clear();
    toastId = toast(message, options);
  }

  return toastId;
}

export const txMessage = async (
  tx: TransactionResponse,
  message = "Sending..."
) => {
  const toastId = toastMessage(message, "info", 600000);
  if (toastId) {
    try {
      await tx.wait().then(async (receipt) => {
        toast.dismiss(toastId);
        toastVisibility.delete(`info-${message}`);
        if (receipt && receipt.status == 1) {
          setTimeout(() => toastMessage("Successful", "success"), 0);
        } else {
          setTimeout(() => toastMessage("Failed", "error"), 0);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};

export const txApprove = async (tx: TransactionResponse) => {
  const toastId = toastMessage("Approving...", "info", 600000);
  if (toastId) {
    await tx.wait().then(async (receipt) => {
      toast.dismiss(toastId);
      toastVisibility.delete("info-Approving...");
      if (receipt && receipt.status == 1) {
        setTimeout(() => toastMessage("Successful", "success"), 0);
      } else {
        setTimeout(() => toastMessage("Failed", "error"), 0);
      }
    });
  }
};
