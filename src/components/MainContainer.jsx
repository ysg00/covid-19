import React, { useState, useEffect } from 'react';

const MainContainer = ({children, ...rest}) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div {...rest}>
      {children}
    </div>
  );
}

export default MainContainer;