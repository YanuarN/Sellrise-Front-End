/**
 * Shared helpers for channel connection UI.
 */

/**
 * Map a connection status string to a Badge color.
 */
export function connectionStatusColor(status) {
  if (status === 'connected') return 'green';
  if (status === 'error') return 'red';
  return 'gray';
}
