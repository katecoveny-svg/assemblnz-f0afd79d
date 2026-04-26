import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  /** Absolute URL to the social share image (1200x630). Defaults to /assembl-og.png. */
  image?: string;
  /** Alt text for the OG image — required for accessible card unfurls. */
  imageAlt?: string;
  /** og:type override — "website" (default), "article", "product", etc. */
  type?: string;
  /** Override og:title (defaults to title). Useful when title contains a brand suffix. */
  ogTitle?: string;
  /** Twitter creator handle, e.g. "@AssemblNZ". */
  twitterCreator?: string;
  /** Optional structured-data block(s). Will be JSON-stringified into <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = "https://www.assembl.co.nz";
const DEFAULT_IMAGE = "https://www.assembl.co.nz/assembl-og.png";
const DEFAULT_TWITTER_SITE = "@AssemblNZ";

const SEO = ({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  imageAlt,
  type = "website",
  ogTitle,
  twitterCreator,
  jsonLd,
}: SEOProps) => {
  const url = `${BASE_URL}${path}`;
  const socialTitle = ogTitle ?? title;
  const finalImageAlt =
    imageAlt ?? "Assembl — quiet AI for New Zealand businesses, gives time back";

  const jsonLdNodes = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Assembl" />

      {/* Geo */}
      <meta name="geo.region" content="NZ-AUK" />
      <meta name="geo.placename" content="Auckland" />
      <meta name="geo.position" content="-36.8485;174.7633" />
      <meta name="ICBM" content="-36.8485, 174.7633" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={socialTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalImageAlt} />
      <meta property="og:site_name" content="Assembl" />
      <meta property="og:locale" content="en_NZ" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULT_TWITTER_SITE} />
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={finalImageAlt} />

      {jsonLdNodes.map((node, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          // react-helmet-async escapes content but doesn't auto-stringify objects
        >
          {JSON.stringify(node)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
