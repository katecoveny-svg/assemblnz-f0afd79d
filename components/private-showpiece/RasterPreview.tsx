'use client';
/** Bounded data URI already validated by brandRasterSchema. Native decoding
 * keeps this review local and avoids an image optimizer/network request. */
export default function RasterPreview({data}:{data:string}){
 // eslint-disable-next-line @next/next/no-img-element -- Owner-selected bounded local data URI; no image service.
 return <img src={data} alt="Selected raster logo awaiting owner review"/>;
}
