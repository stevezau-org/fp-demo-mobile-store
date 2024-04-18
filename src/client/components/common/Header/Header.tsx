import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import MobileNavbar from '../MobileNavbar/MobileNavbar';
import Container from '../Container';
import HeaderBar from '../HeaderBar/HeaderBar';
import classNames from 'classnames';
import { PLATFORM_NAVIGATION, URL, USE_CASES_NAVIGATION } from '../content';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Image from 'next/image';
import Restart from '../../../img/restart.svg';

import {
    UncontrolledDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu as DropdownMenuReactStrap,
} from 'reactstrap';

import styles from './Header.module.scss';
import Link from 'next/link';
import Button from '../Button/Button';
import { useReset } from '../../../hooks/useReset/useReset';
import { Tooltip } from '@mui/material';
import { TEST_IDS } from '../../../testIDs';
import { useUser } from '@auth0/nextjs-auth0/client';

interface HeaderProps {
  notificationBar?: {
    arrowText?: string;
    barBody?: string;
    url?: string;
    backgroundColor?: string;
  };
  darkMode?: boolean;
}
export default function Header({ notificationBar, darkMode }: HeaderProps) {
  const { user, isLoading } = useUser();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mobileBodyClass = 'isMobileMenuOpen';
    if (isMobileMenuOpen) {
      document.body.classList.add(mobileBodyClass);
    } else {
      document.body.classList.remove(mobileBodyClass);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { mutate, shouldDisplayResetButton, isLoading: isResetLoading } = useReset({});

  // @ts-ignore
    return (
    <>
      {notificationBar && !isMobileMenuOpen && (
        <HeaderBar
          linkUrl={notificationBar.url}
          arrowText={notificationBar.arrowText}
          backgroundColor={notificationBar.backgroundColor}
        >
          {<div dangerouslySetInnerHTML={{ __html: notificationBar.barBody ?? '' }} />}
        </HeaderBar>
      )}
      <header className={classNames(styles.header, { [styles.darkHeader]: darkMode })}>
        <div className={styles.nav}>
          <Container size='large' className={styles.root}>
            <nav className={styles.navMain}>
              <div className={styles.navLeft}>
                  <Link href='/' className={styles.link} title='Logo'>
                    <img src='https://d30wkz0ptv5pwh.cloudfront.net/media/logo/stores/3/logo.png'/>
                  </Link>
                  <DropdownMenu
                      darkMode={darkMode}
                      name='Use cases'
                      className={styles.desktopOnly}
                      dropdownProps={{
                          darkMode,
                          leftColumns: [
                              {
                        list: USE_CASES_NAVIGATION.slice(0, 4),
                        cardBackground: true,
                      },
                      {
                        list: USE_CASES_NAVIGATION.slice(4),
                        cardBackground: true,
                      },
                    ],
                  }}
                />
                  <Link href={'/playground'}>Device Info</Link>
                  <Link href={'/database'}>DB</Link>
                  <Link href={'/phone-sale'}>Special Sale Event!</Link>
              </div>
              <div className={styles.navRight}>
                {shouldDisplayResetButton && (
                  <Tooltip
                    title={
                      'Click Restart to remove all information obtained from this browser. This will reenable some scenarios for you if you were locked out of a specific action.'
                    }
                    enterTouchDelay={400}
                  >
                    <button
                      className={classNames(styles.desktopOnly, styles.resetButton, isResetLoading && styles.loading)}
                      onClick={() => mutate()}
                      disabled={isResetLoading}
                      id='click_top_nav_restart'
                      data-testid={TEST_IDS.reset.resetButton}
                    >
                      Restart
                      <Image src={Restart} alt='Restart button' />
                    </button>
                  </Tooltip>
                )}
              {!isLoading && !user && (
                <Button
                  variant='primary'
                  size='medium'
                  className={styles.signupButton}
                  href='/api/auth/login'
                >
                  Login
                </Button>
              )}
              {user && (
                <UncontrolledDropdown nav inNavbar data-testid="navbar-menu-desktop">
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                      height="50"
                      decode="async"
                      data-testid="navbar-picture-desktop"
                    />
                  </DropdownToggle>
                  <DropdownMenuReactStrap>
                    <DropdownItem header data-testid="navbar-user-desktop">
                      {user.name}
                    </DropdownItem>
                    <DropdownItem className="dropdown-profile" tag="span">
                        <Button
                          variant='primary'
                          size='medium'
                          className={styles.signupButton}
                          href='/profile'
                        >
                          Profile
                        </Button>
                    </DropdownItem>
                    <DropdownItem id="qsLogoutBtn">
                        <Button
                          variant='primary'
                          size='medium'
                          className={styles.signupButton}
                          href='/api/auth/logout'
                        >
                          Log out
                        </Button>
                    </DropdownItem>
                  </DropdownMenuReactStrap>
                </UncontrolledDropdown>
              )}
                  <button
                      aria-label='Mobile Menu'
                      className={classNames(styles.mobileToggler, {[styles.isOpen]: isMobileMenuOpen})}
                      onClick={handleToggleMobileMenu}
                  >
                      {/* hamburger button */}
                      <span/>
                      <span/>
                      <span />
                  <span />
                </button>
              </div>
            </nav>
          </Container>
          {isMobileMenuOpen && <MobileNavbar darkMode={darkMode} closeMobileMenu={() => setIsMobileMenuOpen(false)} />}
        </div>
      </header>
    </>
  );
}
