import NavButton from "@/components/buttons/NavButton";
import { Stack } from "@mantine/core";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { FC } from "react";

interface CollapseButtonProps {
  sidebarWasExpanded: boolean;
  handleCollapseClick: () => void;
}

const CollapseButton: FC<CollapseButtonProps> = ({
  sidebarWasExpanded,
  handleCollapseClick,
}) => {
  return (
    <Stack>
      <NavButton
        href="#"
        icon={
          sidebarWasExpanded ? (
            <IconLayoutSidebarLeftCollapse size={20} />
          ) : (
            <IconLayoutSidebarLeftExpand size={20} />
          )
        }
        label="Collapse"
        isCollapsed={!sidebarWasExpanded}
        closeMobileSidebarNav={handleCollapseClick}
      />
    </Stack>
  );
};

export default CollapseButton;
