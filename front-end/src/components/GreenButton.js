/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, forwardRef } from 'react';
import { Image, Box, Flex, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import * as colors from '../utils/colors';

const GreenButton = forwardRef(
  (
    {
      text,
      width,
      height,
      onClick,
      isLoading,
      children,
      style,
      isDisabled,
      maxWidth,
    },
    ref
  ) => (
    <Button
      onClick={onClick}
      {...(width ? { width } : {})}
      {...(maxWidth ? { maxWidth } : {})}
      {...(height ? { height } : {})}
      colorScheme="green"
      bg={colors.green.dark}
      style={style}
      _hover={{ bg: colors.green.medium }}
      borderColor={colors.green.dark}
      _active={{
        bg: colors.green.light,
        transform: 'scale(0.98)',
        borderColor: colors.green.dark,
      }}
      _focus={{
        boxShadow: `0 0 1px 2px ${colors.green.dark}, 0 1px 1px rgba(0, 0, 0, .15)`,
      }}
      isDisabled={isDisabled}
      ref={ref}
    >
      {children}
    </Button>
  )
);

GreenButton.propTypes = {
  text: PropTypes.string,
  width: PropTypes.string,
  maxWidth: PropTypes.string,
  height: PropTypes.string,
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  style: PropTypes.shape({}),
  isDisabled: PropTypes.bool,
};
GreenButton.defaultProps = {
  text: 'Button',
  width: null,
  maxWidth: null,
  height: null,
  onClick: () => null,
  isLoading: false,
  style: {},
  isDisabled: false,
};

export default GreenButton;
