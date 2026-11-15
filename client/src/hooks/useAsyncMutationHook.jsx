import { useState } from "react";
import { toast } from "../utils/alert";

const useAsyncMutation = (mutationHook) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [mutate] = mutationHook();

  const executeMutation = async (tostMessage, ...args) => {
    setIsLoading(true);
    const loadingToastId = toast.loading(
      tostMessage || "Updating something...!!"
    );

    try {
      const response = await mutate(...args).unwrap();
      setData(response);
      if (response?.successMessage) {
        toast.success(response.successMessage, { id: loadingToastId });
      } else {
        toast.dismiss(loadingToastId);
      }
      return { success: true, data: response };
    } catch (err) {
      setError(err);
      toast.error(err?.data?.errorMessage || "Something went wrong!!", {
        id: loadingToastId
      });
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return [executeMutation, isLoading, data, error];
};

export { useAsyncMutation };
