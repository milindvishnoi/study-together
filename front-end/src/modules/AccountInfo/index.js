/* eslint-disable no-undef */
/* eslint-disable arrow-body-style */
import {
  Container,
  VStack,
  Image,
  Text,
  Input,
  Grid,
  HStack,
  GridItem,
  Box,
  Select,
  Textarea,
  ListItem,
  UnorderedList,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import { WithContext as ReactTags } from 'react-tag-input';
import CustomSpinner from '../../components/CustomSpinner';
import { apiURL } from '../../utils/constants';
import defUserImage from '../../assets/images/defuser.jpeg';
import GreenButton from '../../components/GreenButton';
import DetailedGroup from '../../components/DetailedGroup';
import { logout, updateUserDetails } from '../../actions/Auth';
import useHover from '../../hooks/useHover';
import * as colors from '../../utils/colors';

function AccountInfo({ authToken, userDetails, dispatch }) {
  const navigate = useNavigate();
  const [unfollowIsOpen, setUnfollowIsOpen] = React.useState(false);
  const onUnfollowClose = () => setUnfollowIsOpen(false);
  const unfollowCancelRef = React.useRef();
  const [hoverRef, isHovering] = useHover();
  const { id } = useParams();
  const [loading, setLoading] = useState({
    groups: false,
    user: false,
  });
  const universityColorText = {
    'University of Toronto': { color: colors.UofTblue.medium, text: 'UofT' },
  };
  const [dataUpdated, setDataUpdated] = useState(false);
  const [errorOccured, setErrorOccured] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: 'Geralt',
    lastName: 'Stan',
    profileAboutMe:
      "I am a first year student at UTM who's majoring in CS, and trying to find like-minded people",
    role: 'Student',
    profileImage: defUserImage,
    profileContactInfo:
      'You can reach me on Instagram, Snapchat, or email. I usually respond on the same day. IG: geralt.stan, Email: geralt.s@mail.utoronto.ca',
    profileInterests:
      'I like playing the Witcher 3 on my PS4 whever I catch a break from my school-work, and watching Naruto. I also like working on side-projects pertaining to AI.',
    profileCourses: [
      { id: '0', text: 'CSC301' },
      { id: '1', text: 'CSC302' },
    ],
    profileFollowing: [],
    verified: 'false',
  });
  const [oldUserInfo, setOldUserInfo] = useState({});
  const [groups, setGroups] = useState([]);
  const [dialogBoxState, setDialogBoxState] = useState({
    openEmailReminder: true,
    displaySentAlert: false,
  });
  useEffect(() => {
    if (authToken === null) setTimeout(() => navigate('/login'), 3000);
  }, [authToken]);

  useEffect(() => {
    const config = {
      headers: { Authorization: `JWT ${authToken}` },
    };
    setLoading({
      ...loading,
      user: true,
      groups: true,
    });
    axios
      .get(`${apiURL}/users/profile/${id}`, config)
      .then(res => {
        setLoading({
          ...loading,
          user: false,
        });
        setFollowed(res.data.profileFollowers.includes(userDetails.id));
        setOldUserInfo({
          ...res.data,
          profileCourses: res.data.profileCourses.map((c, index) => {
            const i = index.toString();
            return { id: i, text: c };
          }),
        });
        setUserInfo({
          ...res.data,
          profileCourses: res.data.profileCourses.map((c, index) => {
            const i = index.toString();
            return { id: i, text: c };
          }),
        });
        console.log(userInfo);
        setLoading({
          ...loading,
          user: false,
        });
      })
      .catch(err => {
        setLoading({
          ...loading,
          user: false,
        });
        console.log(err);
        if (err.response.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
    axios
      .get(`${apiURL}/studygroups/registered`, config)
      .then(res => {
        setGroups(res.data);
        setLoading({
          ...loading,
          groups: false,
        });
      })
      .catch(err => {
        setLoading({
          ...loading,
          groups: false,
        });
        if (err.response.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
  }, [id]);

  const handleDelete = i => {
    setUserInfo({
      ...userInfo,
      profileCourses: [
        ...userInfo.profileCourses.filter((tag, index) => index !== i),
      ],
    });
  };

  const handleAddition = c => {
    setUserInfo({
      ...userInfo,
      profileCourses: [...userInfo.profileCourses, c],
    });
  };

  const sendEmailVerification = () => {
    const config = {
      headers: { Authorization: `JWT ${authToken}` },
    };
    console.log(id);
    console.log(authToken);
    axios
      .get(`${apiURL}/users/send-verification/${id}`, config)
      .then(() => {})
      .catch(err => {
        if (err.response.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      });
  };
  const saveUserInfo = () => {
    if (JSON.stringify(userInfo) === JSON.stringify(oldUserInfo)) return;
    const config = {
      headers: { Authorization: `JWT ${authToken}` },
    };

    const body = {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      profileAboutMe: userInfo.profileAboutMe,
      role: userInfo.role,
      profileImage: userInfo.profileImage,
      profileContactInfo: userInfo.profileContactInfo,
      profileInterests: userInfo.profileInterests,
      profileCourses: userInfo.profileCourses.reduce((acc, curr) => {
        acc.push(curr.text);
        return acc;
      }, []),
    };
    axios
      .patch(`${apiURL}/users/profile`, body, config)
      .then(() => {
        setDataUpdated(true);
        setInterval(() => {
          setDataUpdated(false);
        }, 3000);
        if (
          userDetails.lastName !== userInfo.lastName ||
          userDetails.firstName !== userInfo.firstName
        ) {
          const updatedUserDetails = {
            ...userDetails,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
          };
          dispatch(updateUserDetails(updatedUserDetails));
        }
      })
      .catch(err => {
        console.log(err);
        setErrorOccured(true);
        if (err.response.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
        setUserInfo(oldUserInfo);
        setInterval(() => {
          setErrorOccured(false);
        }, 3000);
      });
  };

  const handleFollow = () => {
    const isFollow = followed;
    const config = {
      headers: { Authorization: `JWT ${authToken}` },
    };
    if (isFollow) onUnfollowClose();
    const prefix = !isFollow ? '' : 'un';
    axios
      .patch(`${apiURL}/users/profile/${prefix}follow/${id}`, {}, config)
      .then(() => {
        setFollowed(!isFollow);
        let { profileFollowers } = userInfo;
        if (isFollow)
          profileFollowers = profileFollowers.filter(
            uid => uid !== userDetails.id
          );
        else profileFollowers.push(userDetails.id);
        setUserInfo({ ...userInfo, profileFollowers });
      })
      .catch(err => {
        console.log(err);
        setErrorOccured(true);
        if (err.response.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
        setFollowed(!followed);
        setInterval(() => {
          setErrorOccured(false);
        }, 3000);
      });
  };

  const displayFollowers = (number, title) => (
    <Box as="button" onClick={() => navigate(`/following/${id}`)}>
      <VStack>
        <Text fontSize="xl" as="b" color={colors.grey.dark}>
          {number}
        </Text>
        <Text color={colors.grey.dark} style={{ marginTop: 0 }}>
          {title}
        </Text>
      </VStack>
    </Box>
  );

  const [edit, setEdit] = useState(false);

  if (authToken === null) {
    return (
      <Container maxW="container.lg">
        <Alert status="warning">
          <AlertIcon />
          You need to be logged in to view your saved study groups. Redirecting
          you to the login page now...
        </Alert>
      </Container>
    );
  }

  return !loading.groups && !loading.user ? (
    <Container
      maxW="container.lg"
      style={
        userInfo.verified !== '' &&
        userInfo.verified !== 'false' &&
        (!dialogBoxState.openEmailReminder || dialogBoxState.displaySentAlert)
          ? { marginTop: '2rem' }
          : { marginTop: '0.5rem' }
      }
    >
      {userDetails &&
        userDetails.id === id &&
        dialogBoxState.openEmailReminder &&
        (userInfo.verified === '' ||
          userInfo.verified === 'false' ||
          userInfo.verified === false) && (
          <Alert
            status="warning"
            height="50px"
            style={{ marginBottom: '1.5rem' }}
          >
            <AlertIcon />
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => {
                setDialogBoxState({
                  ...dialogBoxState,
                  openEmailReminder: false,
                });
              }}
            />
            <AlertDescription
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
              }}
            >
              Your email has not been verified, resend the verification link:
              <GreenButton
                style={{
                  color: 'white',
                  //  backgroundColor: '#ffeccc',
                  // backgroundColor: 'blue',
                  maxWidth: '90px',
                  marginLeft: '0.45rem',
                  fontSize: '14px',
                  maxHeight: '28px',
                }}
                onClick={() => {
                  sendEmailVerification();
                  setDialogBoxState({
                    ...dialogBoxState,
                    openEmailReminder: false,
                    displaySentAlert: true,
                  });
                }}
              >
                Resend Link
              </GreenButton>
            </AlertDescription>
          </Alert>
        )}
      {userDetails && userDetails.id === id && dialogBoxState.displaySentAlert && (
        <Alert status="info" height="50px" style={{ marginBottom: '1.5rem' }}>
          <AlertIcon />
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => {
              setDialogBoxState({
                ...dialogBoxState,
                displaySentAlert: false,
              });
            }}
          />
          <AlertDescription
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px',
            }}
          >
            Verification email sent
          </AlertDescription>
        </Alert>
      )}
      <Grid templateColumns="repeat(2, 1fr)" gap={12}>
        <GridItem
          colSpan={[12, 12, 1]}
          style={{
            boxShadow: `2px 2px 2px 2px ${colors.grey.light}`,
            borderColor: 'colors.grey.medium',
            borderWidth: '1px',
          }}
          borderRadius="lg"
          p={8}
          mb={4}
          w={['100%', '100%', '300px']}
        >
          <VStack w="100%" alignItems="flex-start" justifyItems="left">
            {edit ? (
              <VStack w="100%" justifyContent="center">
                <Box style={{ display: 'flex', alignItems: 'center' }} w="full">
                  <Text justifySelf="flex-start" as="b" mr={1}>
                    Image URL:
                  </Text>
                  <Input
                    onChange={e =>
                      setUserInfo({
                        ...userInfo,
                        profileImage: e.target.value,
                      })
                    }
                    value={userInfo.profileImage}
                    placeholder="Image URL"
                  />
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center' }} w="full">
                  <Text justifySelf="flex-start" as="b" mr={1}>
                    First Name:
                  </Text>
                  <Input
                    maxW="200px"
                    onChange={e =>
                      setUserInfo({
                        ...userInfo,
                        firstName: e.target.value,
                      })
                    }
                    value={userInfo.firstName}
                    placeholder="First Name"
                  />
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center' }} w="full">
                  <Text justifySelf="flex-start" as="b" mr={1}>
                    Last Name:
                  </Text>
                  <Input
                    maxW="200px"
                    onChange={e =>
                      setUserInfo({
                        ...userInfo,
                        lastName: e.target.value,
                      })
                    }
                    value={userInfo.lastName}
                    placeholder="Last Name"
                  />
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center' }} w="full">
                  <Text justifySelf="flex-start" as="b" mr={1}>
                    Role:
                  </Text>
                  <Select
                    width="175px"
                    maxW="200px"
                    defaultValue={userInfo.role}
                    onChange={e =>
                      setUserInfo({
                        ...userInfo,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="Student">Student</option>
                    <option value="TA">TA</option>
                    <option value="Teacher">Teacher</option>
                  </Select>
                </Box>
                <Text alignSelf="flex-start" as="b" mr={1}>
                  Description:
                </Text>
                <Textarea
                  value={userInfo.profileAboutMe}
                  onChange={e =>
                    setUserInfo({
                      ...userInfo,
                      profileAboutMe: e.target.value,
                    })
                  }
                  size="md"
                />
                <Text alignSelf="flex-start" as="b" mr={1}>
                  Contact Info:
                </Text>
                <Textarea
                  value={userInfo.profileContactInfo}
                  onChange={e =>
                    setUserInfo({
                      ...userInfo,
                      profileContactInfo: e.target.value,
                    })
                  }
                  size="md"
                />
                <Text alignSelf="flex-start" as="b" mr={1}>
                  Interests:
                </Text>
                <Textarea
                  value={userInfo.profileInterests}
                  onChange={e =>
                    setUserInfo({
                      ...userInfo,
                      profileInterests: e.target.value,
                    })
                  }
                  size="md"
                />

                <Text alignSelf="flex-start" as="b" mr={1}>
                  Courses I&apos;m taking:
                </Text>
                <ReactTags
                  tags={userInfo.profileCourses}
                  handleDelete={handleDelete}
                  handleAddition={handleAddition}
                  inputFieldPosition="bottom"
                  autocomplete
                />

                <GreenButton
                  width="200px"
                  style={{ fontSize: '20px' }}
                  onClick={() => {
                    setEdit(false);
                    saveUserInfo();
                  }}
                >
                  Save
                </GreenButton>
              </VStack>
            ) : (
              <VStack w="100%">
                <Image
                  src={userInfo.profileImage}
                  borderRadius="full"
                  boxSize="200px"
                  alignSelf="center"
                />
                {userInfo.verified !== 'false' &&
                  userInfo.verified !== 'Not University Email' && (
                    <Text
                      style={{
                        backgroundColor:
                          universityColorText[userInfo.verified].color,
                        color: 'white',
                        paddingLeft: '6px',
                        paddingRight: '6px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        marginTop: '16px',
                      }}
                    >
                      {universityColorText[userInfo.verified].text}
                    </Text>
                  )}
                {userInfo.verified === 'Not University Email' &&
                  userDetails &&
                  id === userDetails.id && (
                    <Text
                      style={{
                        backgroundColor: colors.grey.medium,
                        color: 'white',
                        paddingLeft: '6px',
                        paddingRight: '6px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        marginTop: '16px',
                      }}
                    >
                      Verified
                    </Text>
                  )}
                <HStack spacing="20px">
                  {userInfo.profileFollowers
                    ? displayFollowers(
                        userInfo.profileFollowers.length,
                        'Followers'
                      )
                    : displayFollowers(0, 'Followers')}
                  {userInfo.profileFollowing
                    ? displayFollowers(
                        userInfo.profileFollowing.length,
                        'Following'
                      )
                    : displayFollowers(0, 'Following')}
                </HStack>
                {userDetails && id !== userDetails.id && (
                  <Box style={{ marginTop: '20px' }}>
                    {!followed ? (
                      <GreenButton
                        width="100px"
                        onClick={handleFollow}
                        alignSelf="center"
                      >
                        Follow
                      </GreenButton>
                    ) : (
                      //  TODO: create a new <CustomButton> that is composed by GreenButton instead of overriding GreenButton.
                      <GreenButton
                        width="100px"
                        onClick={() => setUnfollowIsOpen(true)}
                        style={{
                          backgroundColor: !isHovering
                            ? colors.green.dark
                            : colors.red.medium,
                        }}
                        alignSelf="center"
                        ref={hoverRef}
                      >
                        {isHovering ? 'Unfollow' : 'Following'}
                      </GreenButton>
                    )}
                  </Box>
                )}
                <AlertDialog
                  isOpen={unfollowIsOpen}
                  leastDestructiveRef={unfollowCancelRef}
                  onClose={onUnfollowClose}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        {`Unfollow ${userInfo.firstName} ?`}
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        You will no longer receive notifications about this
                        user&apos;s activity.
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button
                          ref={unfollowCancelRef}
                          onClick={onUnfollowClose}
                        >
                          Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleFollow} ml={3}>
                          Unfollow
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>

                <Divider orientation="horizontal" />
                <Text
                  fontSize={18}
                  as="b"
                  //    alignSelf="flex-start"
                  color={colors.grey.dark}
                  style={{ textAlign: 'center' }}
                >
                  {userInfo.firstName} {userInfo.lastName} ({userInfo.role})
                </Text>
                <Text color={colors.grey.dark}>{userInfo.profileAboutMe}</Text>
                {userDetails && id === userDetails.id ? (
                  <GreenButton
                    width="200px"
                    style={{ fontSize: '20px' }}
                    onClick={() => setEdit(true)}
                    alignSelf="center"
                  >
                    Edit
                  </GreenButton>
                ) : null}
                {userInfo.profileContactInfo ? (
                  <Box w="100%">
                    <Text
                      color={colors.grey.dark}
                      as="b"
                      alignSelf="flex-start"
                      fontSize={18}
                    >
                      Contact Info
                    </Text>
                    <Text color={colors.grey.dark}>
                      {userInfo.profileContactInfo}
                    </Text>
                  </Box>
                ) : null}
                {userInfo.profileInterests ? (
                  <Box w="100%">
                    <Text
                      color={colors.grey.dark}
                      as="b"
                      alignSelf="flex-start"
                      fontSize={18}
                    >
                      Interests
                    </Text>
                    <Text color={colors.grey.dark}>
                      {userInfo.profileInterests}
                    </Text>
                  </Box>
                ) : null}
                {userInfo.profileCourses &&
                userInfo.profileCourses.length !== 0 ? (
                  <Box w="100%">
                    <Text
                      color={colors.grey.dark}
                      as="b"
                      alignSelf="flex-start"
                      fontSize={18}
                    >
                      Courses I&apos;m taking
                    </Text>
                    <Box alignContent="flex-start" w="full">
                      <Text>I&apos;m enrolled in:</Text>
                      <UnorderedList>
                        {userInfo.profileCourses.map(c => (
                          <ListItem ml={2}>{c.text}</ListItem>
                        ))}
                      </UnorderedList>
                    </Box>
                  </Box>
                ) : null}
              </VStack>
            )}
          </VStack>
          {dataUpdated ? (
            <Alert
              style={{
                width: '100%',
              }}
              status="success"
              mt={5}
            >
              <AlertIcon />
              <AlertDescription>User information was updated!</AlertDescription>
            </Alert>
          ) : null}
          {errorOccured ? (
            <Alert
              style={{
                width: '100%',
              }}
              status="error"
              mt={5}
            >
              <AlertIcon />
              <AlertDescription>
                User information could not be updated. Please try agian!
              </AlertDescription>
            </Alert>
          ) : null}
        </GridItem>
        <GridItem
          colStart={[1, 1, 2]}
          colEnd={12}
          colSpan={[12, 12, 10]}
          rowSpan={2}
          style={{
            boxShadow: `3px 3px 3px 3px ${colors.grey.light}`,
            borderColor: 'colors.grey.medium',
            borderWidth: '1px',
          }}
          borderRadius="lg"
          p={8}
          mb={4}
        >
          <VStack w="full" alignItems="flex-start">
            <Text fontSize={[10, 25, 30]} as="b" color={colors.grey.dark}>
              {groups.length === 0
                ? "You aren't part of any study groups."
                : 'Study groups you are part of:'}
            </Text>
            {groups.length > 0
              ? groups.map(g => (
                  <DetailedGroup
                    key={g}
                    title={g.title}
                    restrict="UofT students"
                    availability={`${g.maxAttendees - g.curAttendees} / ${
                      g.maxAttendees
                    }`}
                    imgAlt="Study group image"
                    img={g.imageUrl}
                    when={moment(g.startDateTime).format(
                      'dddd, MMM DD, yyyy HH:mm a'
                    )}
                    durationHours={moment(g.endDateTime).diff(
                      moment(g.startDateTime),
                      'hours'
                    )}
                    durationMins={moment(g.endDateTime)
                      .subtract(
                        moment(g.endDateTime).diff(
                          moment(g.startDateTime),
                          'hours'
                        ),
                        'hours'
                      )
                      .diff(moment(g.startDateTime), 'minutes')}
                    host={g.hostName}
                    hostId={g.hostId}
                    desc={g.description}
                    status={{
                      reschedule: g.rescheduled,
                      cancelled: g.canceled,
                      full: g.maxAttendees - g.curAttendees === 0,
                    }}
                    link={`/groups/${g._id}`}
                  />
                ))
              : null}
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  ) : (
    <CustomSpinner />
  );
}

AccountInfo.propTypes = {
  authToken: PropTypes.string,
  userDetails: {
    id: PropTypes.string,
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  },
  dispatch: PropTypes.func.isRequired,
};

AccountInfo.defaultProps = {
  authToken: '',
  userDetails: {
    id: '',
    email: '',
    firstName: '',
    lastName: '',
  },
};

export default connect(state => ({
  // eslint-disable-next-line no-undef
  authToken: state.Auth.authToken || localStorage.getItem('authToken'),
  userDetails:
    (Object.keys(state.Auth.userDetails).length === 0
      ? null
      : state.Auth.userDetails) ||
    JSON.parse(localStorage.getItem('userDetails')),
}))(AccountInfo);
