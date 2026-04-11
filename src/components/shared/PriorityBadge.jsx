import React from 'react';
import { Badge, HStack, Text, Tooltip, Box } from '@chakra-ui/react';

const CONFIG = {
  High:   { color: 'red',    emoji: '🔴', label: 'High Priority' },
  Medium: { color: 'yellow', emoji: '🟡', label: 'Medium Priority' },
  Low:    { color: 'green',  emoji: '🟢', label: 'Low Priority' },
};

/**
 * Reusable priority badge. Shows level + numeric score.
 * @param {string} priorityLevel - 'High' | 'Medium' | 'Low' | null
 * @param {number} priorityScore - 0-100 | null
 * @param {string} size - 'sm' | 'md'
 */
const PriorityBadge = ({ priorityLevel, priorityScore, size = 'md' }) => {
  if (!priorityLevel) {
    return (
      <Badge colorScheme="gray" fontSize="xs" px={2} py={1} rounded="full">
        Calculating…
      </Badge>
    );
  }

  const { color, emoji, label } = CONFIG[priorityLevel] || CONFIG.Low;
  const fontSize = size === 'sm' ? 'xs' : 'sm';

  return (
    <Tooltip
      label={`Priority Score: ${priorityScore ?? 'N/A'}/100`}
      hasArrow
      placement="top"
    >
      <Badge
        colorScheme={color}
        fontSize={fontSize}
        px={3}
        py={1}
        rounded="full"
        cursor="default"
        display="inline-flex"
        alignItems="center"
        gap={1}
      >
        <Text as="span" fontSize="10px">{emoji}</Text>
        {label}
        {priorityScore != null && (
          <Text as="span" opacity={0.8} ml={1}>
            ({priorityScore})
          </Text>
        )}
      </Badge>
    </Tooltip>
  );
};

export default PriorityBadge;