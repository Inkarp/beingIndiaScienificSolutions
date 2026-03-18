
import Model from './Model';

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;

  let keywords = [];

  /* ---------- DEFAULT ---------- */
  if (slug.length === 0) {
    return {
      title: 'Products | Being',
      description: 'Browse laboratory instruments and product categories by Being.',
    };
  }

  const categorySlug = slug[0];

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const res = await fetch(
      `${baseUrl}/api/products/${categorySlug}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error('API failed');

    const categoryData = await res.json();

    const subSlug = slug[1];
    const modelSlug = slug[2];

    let title = `${categorySlug.replace(/-/g, ' ')} | Being`;
    let description = `Explore ${categorySlug.replace(/-/g, ' ')} laboratory instruments from Being.`;

    /* ---------- SUBCATEGORY ---------- */
    if (subSlug) {
      const subCategory = categoryData.subcategories?.find(
        (s) => s.slug === subSlug
      );

      if (subCategory) {
        title = `${subCategory.name} | Being`;
        description = `Discover ${subCategory.name} instruments with specifications, applications, and service support.`;
      }

      /* ---------- MODEL ---------- */
      if (modelSlug && subCategory) {
        const model = subCategory.models?.find(
          (m) => m.meta.slug.toLowerCase() === modelSlug.toLowerCase()
        );

        if (model) {
          title = `${model.meta.title} | Being`;

          description =
            model.meta.description ||
            model.overview?.[0] ||
            `Technical details and applications of ${model.meta.title}.`;

          if (model.meta.keywords) {
            keywords = Array.isArray(model.meta.keywords)
              ? model.meta.keywords
              : model.meta.keywords.split(',').map(k => k.trim());
          }
        }
      }
    }

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `/products/${slug.join('/')}`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/products/${slug.join('/')}`,
      },
    };
  } catch (error) {
    console.error('Metadata error:', error);

    return {
      title: 'Product | Being',
      description: 'Explore laboratory instruments and solutions by Being.',
    };
  }
}

/* ---------- PAGE RENDER ---------- */
export default function Page() {
  return <Model />;
}
