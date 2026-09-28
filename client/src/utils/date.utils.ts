export const formatDateForApi = (dateString: string | Date): string => {
  if (!dateString) return '';
  return new Date(dateString).toISOString();
};
