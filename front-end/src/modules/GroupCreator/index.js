/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  Heading,
  Input,
  VStack,
  Box,
  Alert,
  AlertIcon,
  CloseButton,
  Select,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Auth } from '../../actions';
import * as colors from '../../utils/colors';
import { userRoles } from '../../utils/constants';
import GoogleMap from '../../components/Map';
import GreenButton from '../../components/GreenButton';

function GroupCreator({ authState, dispatch }) {
  const [registrationDetails, setRegistrationDetails] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    userName: '',
    rememberUser: false,
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
    userName: '',
    firstName: '',
    lastName: '',
  });
  const [forceHideAlert, setForceHideAlert] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = event => {
    setErrors({ ...errors, email: false });
    setRegistrationDetails({
      ...registrationDetails,
      email: event.target.value,
    });
  };
  const handleFirstNameChange = event => {
    setErrors({ ...errors, firstName: false });
    setRegistrationDetails({
      ...registrationDetails,
      firstName: event.target.value,
    });
  };
  const handleLastNameChange = event => {
    setErrors({ ...errors, lastName: false });
    setRegistrationDetails({
      ...registrationDetails,
      lastName: event.target.value,
    });
  };
  const handlePasswordChange = event => {
    setErrors({ ...errors, password: false });
    setRegistrationDetails({
      ...registrationDetails,
      password: event.target.value,
    });
  };
  const handleConfirmPasswordChange = event => {
    setRegistrationDetails({
      ...registrationDetails,
      confirmPassword: event.target.value,
    });
    if (
      event.target.value === registrationDetails.password ||
      event.target.value === ''
    )
      setErrors({ ...errors, confirmPassword: false });
    else setErrors({ ...errors, confirmPassword: true });
  };

  const handleRoleChange = event => {
    setErrors({ ...errors, role: false });
    setRegistrationDetails({
      ...registrationDetails,
      role: event.target.value,
    });
  };
  const handleUserNameChange = event => {
    setErrors({ ...errors, userName: false });
    setRegistrationDetails({
      ...registrationDetails,
      userName: event.target.value,
    });
  };

  // function taken from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
  const validateEmail = email =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const handleSubmit = () => {
    const {
      email,
      password,
      role,
      confirmPassword,
      userName,
      firstName,
      lastName,
    } = registrationDetails;
    const isEmailInvalid = !validateEmail(email);
    const isPasswordInvalid = password.length < 6;
    const userNameInvalid = userName.length <= 3;
    const passwordConfirmDoesntMatch = password !== confirmPassword;
    const roleNotSelected = role === '';
    const firstNameInvalid = firstName.length === 0;
    const lastNameInvalid = lastName.length === 0;

    if (
      isEmailInvalid ||
      isPasswordInvalid ||
      userNameInvalid ||
      roleNotSelected ||
      passwordConfirmDoesntMatch ||
      firstNameInvalid ||
      lastNameInvalid
    )
      return setErrors({
        ...errors,
        email: isEmailInvalid,
        password: isPasswordInvalid,
        confirmPassword: passwordConfirmDoesntMatch,
        role: roleNotSelected,
        userName: userNameInvalid,
        firstName: firstNameInvalid,
        lastName: lastNameInvalid,
      });

    setForceHideAlert(false);
    return dispatch(Auth.register(registrationDetails));
  };

  useEffect(() => {
    if (authState.authToken !== '') navigate('/');
  }, [authState.authToken]);

  return (
    <div style={{ height: '49vh' }}>
      <Box style={{ marginTop: '2rem', padding: '0 2rem' }}>
        <VStack style={{ marginTop: '1rem' }} spacing="20px" align="stretch">
          <Heading as="h2" size="2xl">
            Create a Group
          </Heading>

          <VStack spacing="20px" align="stretch">
            <Input
              autoComplete="off"
              errorBorderColor="crimson"
              isInvalid={errors.email}
              placeholder="Group Name"
              onChange={handleEmailChange}
              value={registrationDetails.email}
            />

            <Select
              isInvalid={errors.role}
              placeholder="What is the purpose of this group?"
              onChange={handleRoleChange}
            >
              {userRoles.map((key, index) => (
                <option value={key}>{key}</option>
              ))}
            </Select>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                gap: '20px',
              }}
            >
              <GreenButton
                onClick={handleSubmit}
                colorScheme="green"
                bg={colors.green.dark}
                style={{ alignSelf: 'flex-start' }}
                // isLoading
                // spinner={<BeatLoader size={8} color="white" />}
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
                isLoading={authState.loading || false}
              >
                Register
              </GreenButton>
              {!forceHideAlert && authState.error && (
                <Alert status="error">
                  <AlertIcon />
                  There was an error during the registration process (
                  {authState.error}).
                  <CloseButton
                    position="absolute"
                    right="8px"
                    top="8px"
                    onClick={() => setForceHideAlert(true)}
                  />
                </Alert>
              )}
            </div>
          </VStack>
        </VStack>
      </Box>
      <Box
        style={{
          marginTop: '2rem',
        }}
      >
        <GoogleMap style={{ width: 'calc(100% - 4rem)', height: '100%' }} />
      </Box>
    </div>
  );
}

GroupCreator.propTypes = {
  authState: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.string,
    authToken: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

GroupCreator.defaultProps = {};

export default connect(state => ({
  authState: state.Auth,
}))(GroupCreator);
