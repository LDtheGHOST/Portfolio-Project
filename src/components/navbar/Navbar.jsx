"use client";

import React from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import AuthLinks from "../authLinks/AuthLinks";
import ThemeToggle from "../themeToggle/ThemeToggle";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.social}>
        <Image className={styles.img} src="/facebook.png" alt="facebook" width={24} height={24}/>
        <Image className={styles.img} src="/instagram.png" alt="instagram" width={24} height={24}/>
        <Image className={styles.img} src="/tiktok.png" alt="tiktok" width={24} height={24}/>
        <Image className={styles.img} src="/x.png" alt="x" width={24} height={24}/>
        <Image className={styles.img} src="/youtube.png" alt="youtube" width={24} height={24}/>
      </div>
      <div className={styles.logo}>LD COMEDY & CO</div>
      <div className={styles.links}>
        <ThemeToggle />
        <Link href="/" className={styles.Link}>Homepage</Link>
        <Link href="/"className={styles.Link}>Contact</Link>
        <Link href="/"className={styles.Link}>About</Link>
        <AuthLinks />
      </div>
    </div>
  );
}

export default Navbar;