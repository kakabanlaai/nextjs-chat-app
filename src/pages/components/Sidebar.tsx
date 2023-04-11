import { Avatar } from '@mui/material';
import { useState } from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div``;

const StyledHeader = styled.div``;

const StyledSearch = styled.div``;

const StyledSidebarButton = styled.button``;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const Sidebar = () => {
  return (
    <StyledContainer>
      <StyledHeader>
        <StyledAvatar />
      </StyledHeader>
      <StyledSearch></StyledSearch>
      <StyledSidebarButton></StyledSidebarButton>
    </StyledContainer>
  );
};

export default Sidebar;
