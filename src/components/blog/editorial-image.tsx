'use client';

import { useState } from 'react';
import Image from 'next/image';
import { blogImageUrl } from '@/lib/blog-presentation';

/** Editorial artwork has no verified caption; do not describe it as a listing. */
export function EditorialImage({ src, priority = false, sizes = '100vw' }: {
  src: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const image = blogImageUrl(src);
  if (!image || failed) return null;
  return <Image src={image} alt="" fill sizes={sizes} priority={priority}
    className="object-cover" unoptimized={/^https?:\/\//i.test(image)}
    onError={() => setFailed(true)} />;
}
