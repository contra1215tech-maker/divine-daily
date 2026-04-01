import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * A custom hook that wraps react-query's useMutation with optimistic UI updates.
 * Immediately updates the local cache before the server responds, ensuring
 * the interface always feels responsive even on slower networks.
 *
 * @param {Object} options
 * @param {string|string[]} options.queryKey - The query key to optimistically update
 * @param {'create'|'update'|'delete'} options.action - The type of mutation
 * @param {Function} options.mutationFn - The actual async mutation function
 * @param {Function} [options.optimisticData] - Function(variables, oldData) => newData for custom optimistic update
 * @param {Function} [options.onSuccess] - Called after successful mutation
 * @param {Function} [options.onError] - Called after failed mutation (data is already rolled back)
 */
export function useOptimisticMutation({
  queryKey,
  action,
  mutationFn,
  optimisticData,
  onSuccess,
  onError,
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onMutate: async (variables) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value for rollback on error
      const previousData = queryClient.getQueryData(queryKey);

      // Apply the optimistic update immediately
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;

        // If a custom optimistic function is provided, use it
        if (optimisticData) {
          return optimisticData(variables, oldData);
        }

        // Built-in strategies per action type
        if (action === 'create') {
          const optimisticItem = {
            id: `optimistic-${Date.now()}`,
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
            ...variables,
          };
          return Array.isArray(oldData)
            ? [optimisticItem, ...oldData]
            : oldData;
        }

        if (action === 'update') {
          // variables is expected to be { id, ...fields } or [id, fields]
          const [id, fields] = Array.isArray(variables)
            ? variables
            : [variables.id, variables];
          return Array.isArray(oldData)
            ? oldData.map((item) =>
                item.id === id ? { ...item, ...fields } : item
              )
            : oldData;
        }

        if (action === 'delete') {
          // variables is expected to be the id string
          const id = typeof variables === 'string' ? variables : variables.id;
          return Array.isArray(oldData)
            ? oldData.filter((item) => item.id !== id)
            : oldData;
        }

        return oldData;
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      // Roll back to the snapshot on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(error, variables, context);
    },

    onSuccess: (data, variables, context) => {
      // Invalidate to sync with server truth
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data, variables, context);
    },
  });
}