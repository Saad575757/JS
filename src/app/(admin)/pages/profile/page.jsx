'use client';

import { Button, Col, Row } from 'react-bootstrap';
import profileBg from '@/assets/images/bg-profile.jpg';
import PageTitle from '@/components/PageTitle';
import Image from 'next/image';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ProfileDetail from './components/ProfileDetail';
import { useEffect, useState } from 'react';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    picture: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage when component mounts
    const loadData = () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        const storedTeacherData = localStorage.getItem('teacherData');
        
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData);
          setUserData(prev => ({ ...prev, ...parsedData }));
        }

        if (storedTeacherData) {
          const parsedTeacherData = JSON.parse(storedTeacherData);
          setUserData(prev => ({ ...prev, ...parsedTeacherData }));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="text-center p-5">Loading profile...</div>;
  }

  return (
    <>
      <PageTitle title="Profile" />
      <Row>
        <Col sm={12}>
          <div 
            className="profile-bg-picture" 
            style={{
              backgroundImage: `url(${profileBg.src})`,
              backgroundPosition: 'bottom'
            }} 
          />
          <div className="p-sm-3 p-0 profile-user">
            <Row className="g-2">
              <Col lg={3} className="d-none d-lg-block">
                <div className="profile-user-img p-2 text-start">
                  <Image 
                    src={userData.picture || avatar1} 
                    alt="avatar" 
                    className="img-thumbnail avatar-lg rounded" 
                    width={150}
                    height={150}
                    priority
                  />
                </div>
                <div className="text-start p-1 pt-2">
                  {/* <h4 className="fs-17 ellipsis">{userData.name || 'No name provided'}</h4>
                  <p className="font-13">
                    {userData.role 
                      ? `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}` 
                      : 'Role not specified'
                    }
                  </p> */}
                  {/* <p className="text-muted mb-0">
                    <small>Location not specified</small>
                  </p> */}
                  {/* <div className="d-flex pt-3 align-items-center justify-content-center flex-xl-nowrap flex-lg-wrap justify-content-md-start">
                    <Button variant="soft-danger" type="button" className="me-sm-2 mt-1 icons-center">
                      <IconifyIcon icon="mdi:cog" className="align-text-bottom me-1 fs-16 lh-1" />
                      Edit Profile
                    </Button>
                    <Button variant="soft-info" className="mt-1">
                      <IconifyIcon icon="mdi:check-all" className="fs-18 me-1 lh-1" />
                      Following
                    </Button>
                  </div> */}
                </div>
                <div className="pt-3 ps-2">
                  <p className="text-muted mb-2 font-13">
                    <strong>Full Name :</strong> <span className="ms-2">{userData.name || 'Not provided'}</span>
                  </p>
                  {/* <p className="text-muted mb-2 font-13">
                    <strong>Mobile :</strong>
                    <span className="ms-2">{userData.phone || 'Not provided'}</span>
                  </p> */}
                  <p className="text-muted mb-2 font-13">
                    <strong>Email :</strong> <span className="ms-2">{userData.email || 'Not provided'}</span>
                  </p>
                  <p className="text-muted mb-1 font-13">
                    <strong>Role :</strong> <span className="ms-2">{userData.role || 'Not provided'}</span>
                  </p>
                </div>
                {/* <div className="text-start mt-4">
                  <h4>Follow On:</h4>
                  <div className="d-flex gap-2 mt-3">
                    <Button className="btn px-2 py-1 btn-soft-primary">
                      <IconifyIcon icon="mdi:facebook" />
                    </Button>
                    <Button className="btn px-2 py-1 btn-soft-danger">
                      <IconifyIcon icon="mdi:google-plus" />
                    </Button>
                    <Button className="btn px-2 py-1 btn-soft-info">
                      <IconifyIcon icon="mdi:twitter" />
                    </Button>
                    <Button className="btn px-2 py-1 btn-soft-dark">
                      <IconifyIcon icon="mdi:github" />
                    </Button>
                  </div>
                </div> */}
              </Col>
              <Col lg={9} className="bg-light-subtle">
                <ProfileDetail userData={userData} />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Profile;