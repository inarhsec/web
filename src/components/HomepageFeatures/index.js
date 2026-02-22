import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import Grid from "@mui/material/Grid";
import Link from "@docusaurus/Link";

const FeatureList = [
  {
    title: "Services",
    link: "docs/category/service",
    Svg: require("@site/static/img/undraw_maintenance_4unj.svg").default,
    description: (
      <>
        Happy to serve organizations with network security, security assessments, and GRC support. 
        I also take on free engagements as part of my learning and experience-building journey. 
        Let’s collaborate..
      </>
    ),
  },
  {
    title: "Notes",
    link:"https://anirhsec.gitbook.io/home/",
//    link: "docs/category/tools",
    Svg: require("@site/static/img/undraw_books_wxzz.svg").default,
    description: (
      <>
        A living notebook of my journey (Currently in Gitbook Will Migrate to Web)
        <br></br> <b>Jack of All trade and Master of None</b> {" "}
        
       {/* <Link to={"docs/tools/pythermalcomfort"}>pythermalcomfort</Link>, the{" "} */}
       {/* <Link to={"docs/tools/cbe-comfort-tool"}>CBE Thermal Comfort Tool</Link> */}
       {/*, the <Link to={"docs/tools/cbe-clima-tool"}>CBE Clima Tool</Link>, */}
       {/*Cozie for <Link to={"docs/tools/cozie"}>Apple</Link> and Fitbit, the{" "} */}
       {/* <Link to={"docs/tools/heatwatch"}>HeatWatch</Link>, and SMA Extreme heat */}
       {/* tool.*/}

      </>
    ),
  },
  {
    title: "YouTube",
    link: "https://www.youtube.com/@inarhsec",
    Svg: require("@site/static/img/undraw_youtube-tutorial_xgp1.svg")
      .default,
    description: (
      <>
       Having small YouTube and I publish video about thing i like{" "}

      </>
    ),
  },
// THIS IS TO BE UPDATED WHEN I HAVE THE IDEA TO ADD MORE FEATURE  
  /*{
    title: "LaTeX",
    link: "docs/category/latex",
    Svg: require("@site/static/img/undraw_add_document_re_mbjx.svg").default,
    description: (
      <>
        I am passionate about LaTeX and I have created a series of{" "}
        <Link to={"docs/category/latex"}>tutorials</Link> and{" "}
        <Link
          to={
            "https://www.youtube.com/playlist?list=PLY91jl6VVD7wnyOlAgPRe-i9ov4_ZqHV8"
          }
        >
          videos
        </Link>{" "}
        to help you get started with LaTeX.
      </>
    ),
  },
  */
];

function Feature({ Svg, title, description, link }) {
  return (
    <>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Link to={link}>
          <Heading as="h3">{title}</Heading>
        </Link>
        <p>{description}</p>
      </div>
    </>
  );
}

export default function HomepageFeatures() {
  return (
    <>
      {FeatureList.map((props, idx) => (
        <Grid key={idx} xs={12} sm={10} md={6}>
          <Feature key={idx} {...props} />
        </Grid>
      ))}
    </>
  );
}
