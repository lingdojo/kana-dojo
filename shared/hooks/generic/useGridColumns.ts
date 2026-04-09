import { useMediaQuery } from 'react-responsive';
import { useEffect, useState } from 'react';

const useGridColumns = () => {
  const [isMounted, setIsMounted] = useState(false);
  const is2XL = useMediaQuery({ minWidth: 1536 }); // 4 cols
  const isLG = useMediaQuery({ minWidth: 1024 }); // 3 cols
  const isMD = useMediaQuery({ minWidth: 768 }); // 2 cols

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return default value during SSR to avoid hydration mismatch
  if (!isMounted) {
    return 1;
  }

  return is2XL ? 3 : isLG ? 2 : isMD ? 1 : 1;
};

export default useGridColumns;
