import React, { useState } from "react";
import styled from "@emotion/styled/macro";
import { Text } from "theme-ui";
import { CopyIcon } from "../../components/Svg";

interface Props {
  toCopy: string;
}

const StyleButton = styled(Text)`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors?.primary};
`;

const Tooltip = styled.div<{ isTooltipDisplayed: boolean }>`
  display: ${({ isTooltipDisplayed }) => (isTooltipDisplayed ? "block" : "none")};
  position: absolute;
  bottom: -20px;
  left: -10px;
  text-align: center;
  //background-color: ${({ theme }) => theme.colors?.primary};
  color: ${({ theme }) => theme.colors?.text};
  border-radius: 16px;
  opacity: 0.7;
`;

const CopyToClipboard: React.FC<Props> = ({ toCopy, children, ...props }) => {
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false);

  const copyToClipboardWithCommand = (content: string) => {
    const el = document.createElement("textarea");
    el.value = content;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  function displayTooltip() {
    setIsTooltipDisplayed(true);
    setTimeout(() => {
      setIsTooltipDisplayed(false);
    }, 1000);
  }

  return (
    <StyleButton
      onClick={() => {
        if (navigator.clipboard && navigator.permissions) {
          navigator.clipboard.writeText(toCopy).then(() => displayTooltip());
        } else if (document.queryCommandSupported("copy")) {
          copyToClipboardWithCommand(toCopy);
          displayTooltip();
        }
      }}
      {...props}
    >
      {children}
      <CopyIcon width="20px" color="green" />
      <Tooltip isTooltipDisplayed={isTooltipDisplayed}>Copied</Tooltip>
    </StyleButton>
  );
};

export { CopyToClipboard }