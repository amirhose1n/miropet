import { LocalShipping } from "@mui/icons-material";
import { Chip, Tooltip } from "@mui/material";
import React from "react";

interface DeliveryMethodChipProps {
  name?: string;
  price?: number;
  subtitle?: string;
  size?: "small" | "medium";
}

const DeliveryMethodChip: React.FC<DeliveryMethodChipProps> = ({
  name,
  price = 0,
  subtitle,
  size = "small",
}) => {
  if (!name) {
    return (
      <Chip
        icon={<LocalShipping />}
        label="روش تحویل نامشخص"
        color="default"
        size={size}
      />
    );
  }

  const formatPrice = (price: number) => {
    return price === 0
      ? "رایگان"
      : new Intl.NumberFormat("fa-IR").format(price) + " تومان";
  };

  const chipLabel = `${name} (${formatPrice(price)})`;
  const tooltipTitle = subtitle ? `${name} - ${subtitle}` : name;

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Chip
        icon={<LocalShipping />}
        label={chipLabel}
        color="primary"
        variant="outlined"
        size={size}
        sx={{
          maxWidth: 200,
          "& .MuiChip-label": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }}
      />
    </Tooltip>
  );
};

export default DeliveryMethodChip;
