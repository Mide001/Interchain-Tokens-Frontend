"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNetwork } from "@/hooks/useNetwork";
import { useTokenPrice } from "@/hooks/useTokenPrice";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  ArrowRight03Icon,
  Wallet01Icon,
  CheckmarkCircle01Icon,
} from "hugeicons-react";
import { parseEther } from "viem";

const modalAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: "spring" as const, damping: 20, stiffness: 300 },
};

type FormData = {
  amount: string;
  recipientAddress: string;
};

export const TransferModal = ({
  isOpen,
  onClose,
  balance,
}: {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isTransferSuccess, setIsTransferSuccess] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const { user } = usePrivy();
  const { wallets } = useWallets();
  useNetwork();
  useTokenPrice();
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  const formMethods = useForm<FormData>({ mode: "onChange" });
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = formMethods;

  const { amount } = watch();

  const handleTransfer = async (data: FormData) => {
    try {
      if (!embeddedWallet || !user?.linkedAccounts) {
        throw new Error("Wallet not connected");
      }

      setIsConfirming(true);
      const provider = await embeddedWallet.getEthereumProvider();
      const address = user.linkedAccounts.find(
        (account) => account.type === "wallet"
      )?.address;

      if (!address) {
        throw new Error("No wallet address found");
      }

      const value = parseEther(data.amount).toString(16);
      const paddedValue = `0x${value}`;

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: data.recipientAddress,
            value: paddedValue,
            gas: "0x5208",
            maxFeePerGas: "0x2540BE400",
            maxPriorityFeePerGas: "0x2540BE400",
          },
        ],
      });

      if (!txHash) {
        throw new Error("Transaction failed - no hash returned");
      }

      setTransferAmount(data.amount);
      setIsTransferSuccess(true);
      toast.success(`${data.amount} ETH successfully transferred`);
      setIsConfirming(false);
      reset();
    } catch (error: unknown) {
      console.error("Transfer failed:", error);
      let errorMessage = "Transfer failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null && "error" in error && typeof error.error === "object" && error.error !== null && "message" in error.error) {
        errorMessage = String((error.error as { message: unknown }).message);
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Handle specific error cases
      if (errorMessage.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transfer";
      } else if (errorMessage.includes("user rejected")) {
        errorMessage = "Transaction was rejected";
      } else if (errorMessage.includes("gas required exceeds allowance")) {
        errorMessage = "Gas limit too low for transaction";
      }

      toast.error(errorMessage);
      setIsConfirming(false);
    }
  };

  const handleModalClose = () => {
    setIsTransferSuccess(false);
    reset();
    onClose();
  };

  const handleMaxClick = () => {
    setValue("amount", balance, { shouldValidate: true, shouldDirty: true });
  };

  const renderSuccessView = () => (
    <div className="space-y-6 pt-4">
      <CheckmarkCircle01Icon className="mx-auto size-10 text-green-500" />

      <div className="space-y-3 pb-5 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Transfer successful
        </h2>

        <p className="text-gray-500">
          {transferAmount} ETH has been successfully transferred to the
          recipient.
        </p>
      </div>

      <button
        type="button"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors duration-200"
        onClick={handleModalClose}
      >
        Close
      </button>
    </div>
  );

  const renderBalanceSection = () => (
    <div className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
      <p className="text-gray-500">Balance</p>
      <div className="flex items-center gap-3">
        {Number(amount) >= Number(balance) ? (
          <p className="text-gray-500">Maxed out</p>
        ) : (
          <button
            type="button"
            onClick={handleMaxClick}
            className="font-medium text-blue-600"
          >
            Max
          </button>
        )}
        <p className="text-[10px] text-gray-300">|</p>
        <p className="font-medium text-gray-900">
          {parseFloat(balance).toFixed(4)} ETH
        </p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleModalClose}
          open={isOpen}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

            <motion.div
              initial={modalAnimation.initial}
              animate={modalAnimation.animate}
              exit={modalAnimation.exit}
              transition={modalAnimation.transition}
              className="relative w-full max-w-md rounded-[20px] border border-gray-200 bg-white p-6 shadow-lg"
            >
              {isTransferSuccess ? (
                renderSuccessView()
              ) : (
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Transfer ETH
                    </h2>
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="rounded-lg p-2 hover:bg-gray-100"
                    >
                      <ArrowRight03Icon className="size-5 text-gray-500" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleTransfer)}
                    className="space-y-4"
                    noValidate
                  >
                    <div className="grid gap-3.5 rounded-[20px] border border-gray-200 px-4 py-3">
                      <label htmlFor="amount" className="text-gray-500">
                        Amount
                      </label>

                      <input
                        id="amount"
                        type="number"
                        step="0.0001"
                        {...register("amount", {
                          required: {
                            value: true,
                            message: "Amount is required",
                          },
                          min: {
                            value: 0.0001,
                            message: "Min. amount is 0.0001",
                          },
                          max: {
                            value: parseFloat(balance),
                            message: `Max. amount is ${parseFloat(
                              balance
                            ).toFixed(4)}`,
                          },
                          pattern: {
                            value: /^\d+(\.\d{1,4})?$/,
                            message: "Invalid amount",
                          },
                        })}
                        className={`w-full rounded-xl border-b border-transparent bg-transparent py-2 text-2xl outline-none transition-all placeholder:text-gray-400 focus:outline-none ${
                          errors.amount ? "text-red-500" : "text-gray-900"
                        }`}
                        placeholder="0"
                      />
                    </div>

                    {renderBalanceSection()}

                    <div className="relative">
                      <Wallet01Icon className="absolute left-3 top-3.5 size-4 text-gray-500" />
                      <input
                        type="text"
                        id="recipient-address"
                        {...register("recipientAddress", {
                          required: {
                            value: true,
                            message: "Recipient address is required",
                          },
                          pattern: {
                            value: /^0x[a-fA-F0-9]{40}$/,
                            message: "Invalid wallet address format",
                          },
                          validate: {
                            length: (value: string) =>
                              value.length === 42 ||
                              "Address must be 42 characters long",
                            prefix: (value: string) =>
                              value.startsWith("0x") ||
                              "Address must start with 0x",
                          },
                        })}
                        className={`min-h-11 w-full rounded-xl border border-gray-200 bg-transparent py-2 pl-9 pr-4 text-sm transition-all placeholder:text-gray-400 focus-within:border-gray-400 focus:outline-none ${
                          errors.recipientAddress
                            ? "text-red-500"
                            : "text-gray-900"
                        }`}
                        placeholder="Recipient wallet address"
                        maxLength={42}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isValid || !isDirty || isConfirming}
                    >
                      {isConfirming ? "Confirming..." : "Confirm transfer"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
