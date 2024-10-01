import { useState } from "react";
import { toast } from "react-toastify";

const useAsyncMutation = (mutationHook) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [mutate] = mutationHook();

  const executeMutation = async (tostMessage, ...args) => {
    let loadingToastId = toast.loading(
      tostMessage || "Updating something...!!"
    );

    try {
      const data = await mutate(...args).unwrap();
      setData(data);
      if (data.successMessage) {
        toast.update(loadingToastId, {
          render: data.successMessage,
          type: "success",
          isLoading: false,
          autoClose: 2000,
          closeButton: true
        });
      }
    } catch (err) {
      setIsLoading(false);
      setError(err);
      toast.update(loadingToastId, {
        render: err.data?.errorMessage || "Something went wrong!!",
        type: "error",
        isLoading: false,
        autoClose: 2000,
        closeButton: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return [executeMutation, isLoading, data, error];
};

export { useAsyncMutation };
