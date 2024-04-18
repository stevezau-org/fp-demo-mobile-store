import React from 'react';
import GithubSVG from './github.svg';
import LinkedInSvg from './linkedin.svg';
import TwitterSvg from './twitter.svg';

import Container from '../Container';
import styles from './Footer.module.scss';
import { URL } from '../content';
import classNames from 'classnames';
import Image from 'next/image';
import LogoSvg from '../Header/fpjs.svg';
import LogoDarkSvg from '../Header/fpjsDark.svg';

interface FooterProps {
  darkVariant?: boolean;
}
export default function Footer({ darkVariant }: FooterProps) {
  return (
    <footer className={classNames(styles.footer, { [styles.dark]: darkVariant })}>
      <Container size='large' className={styles.footerContainer}>
        <section className={styles.logoSection}>
          <a href={URL.mainSite} className={styles.link} title='Logo'>
            <img src='https://d30wkz0ptv5pwh.cloudfront.net/media/logo/stores/3/logo.png'/>
          </a>
          <address className={styles.address}>1440 W. Taylor St #735, Chicago, IL 60607, USA</address>
        </section>
        <section className={styles.socialSection}>
          <div className={styles.copyright}>© AllPhones 2024, Inc</div>
          <ul className={styles.socials}>
            <li className={styles.link}>
              <a href={URL.githubRepoUrl} target='_blank' rel='noreferrer' aria-label='GitHub link'>
                <Image src={GithubSVG} alt='Github logo' />
              </a>
            </li>
            <li className={styles.link}>
              <a href={URL.linkedinUrl} target='_blank' rel='noreferrer' aria-label='LinkedIn link'>
                <Image src={LinkedInSvg} alt='LinkedIn logo' />
              </a>
            </li>
            <li className={styles.link}>
              <a href={URL.twitterUrl} target='_blank' rel='noreferrer' aria-label='Twitter link'>
                <Image src={TwitterSvg} alt='Twitter logo' />
              </a>
            </li>
          </ul>
        </section>
      </Container>
    </footer>
  );
}
