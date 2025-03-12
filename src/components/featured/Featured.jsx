import React from "react";
import styles from "./featured.module.css";
import image from "next/image";

const Featured = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <b className={styles.bold}>Le SPETACLE commence ici</b> le voyage commence ici
      </h1>
      <div className={styles.post}>
        <div className={styles.imgContainer}>
          <image src="/p1.jpeg" alt="" fill className={styles.image} />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>Imaginer un univer de magie de rire et mélencolie</h1>
          <p className={styles.postDesc}>
            ici a mettre le texte de la description de l'article
          </p>
          <button className={styles.button}>Voire plus</button>
        </div>
      </div>
    </div>
  );
}

export default Featured;