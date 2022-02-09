import { Box, Stack, VStack, Text, Image } from '@chakra-ui/react';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as colors from '../utils/colors';

const diffSize = size =>
  size === 'lg'
    ? {
        stackSize: '100%',
        imgWidth: ['300px', '350px', '400px'],
        vstackSpacing: '1.5rem',
        fontSize: '20px',
        noOfLines: '',
        imgMr: ['0', '0', '20px'],
        imgAlign: ['center', 'center', 'left'],
      }
    : {
        stackSize: { base: '300px', md: '400px' },
        imgWidth: '150px',
        vstackSpacing: '6px',
        fontSize: '12px',
        noOfLines: '1',
        imgMr: '',
        imgAlign: ['center', 'center', 'left'],
      };

function CustomText(fontSize, noOfLines, text) {
  return (
    <Text
      as="b"
      color={colors.grey.dark}
      fontSize={fontSize}
      mt="0px"
      noOfLines={noOfLines}
    >
      {text}
    </Text>
  );
}

function SecondGroup({
  title,
  restrict,
  availability,
  when,
  host,
  desc,
  img,
  imgAlt,
  link,
  size,
}) {
  const {
    stackSize,
    imgWidth,
    vstackSpacing,
    fontSize,
    noOfLines,
    imgMr,
    imgAlign,
  } = diffSize(size);
  return (
    <Box
      p={2}
      overflow="hidden"
      bg="none"
      as="button"
      border={0}
      textAlign="left"
      w={stackSize}
    >
      <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Stack
          w={stackSize}
          direction={{ base: 'column', md: 'row' }}
          align="left"
          wrap
        >
          <Image
            src={img}
            width={imgWidth}
            alt={imgAlt}
            borderRadius="lg"
            mr={imgMr}
            alignSelf={imgAlign}
          />
          <VStack justifyContent="center" spacing={vstackSpacing} align="left">
            {CustomText(fontSize, noOfLines, `Title: ${title}`)}
            {CustomText(fontSize, noOfLines, `Restriction: ${restrict}`)}
            {CustomText(fontSize, noOfLines, `Availability: ${availability}`)}
            {CustomText(fontSize, noOfLines, `When: ${when}`)}
            {CustomText(fontSize, noOfLines, `Hosted by: ${host}`)}
            {CustomText(fontSize, noOfLines, `Description: ${desc}`)}
          </VStack>
        </Stack>
      </Link>
    </Box>
  );
}

SecondGroup.propTypes = {
  title: PropTypes.string.isRequired,
  img: PropTypes.element.isRequired,
  imgAlt: PropTypes.string.isRequired,
  restrict: PropTypes.string.isRequired,
  availability: PropTypes.string.isRequired,
  host: PropTypes.string.isRequired,
  when: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  size: 'md' || 'lg',
};

SecondGroup.defaultProps = { size: 'md' };

export default SecondGroup;