export const authInputClass = (hasError: boolean) =>
  `w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`;

export const authInputClassLg = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`;
