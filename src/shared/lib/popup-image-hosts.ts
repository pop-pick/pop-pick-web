export const POPUP_IMAGE_SOURCES = [
	{ hostname: "cdn.popga.co.kr", pathPrefix: "/spot/" },
	{ hostname: "d8nffddmkwqeq.cloudfront.net", pathPrefix: "/store/" },
	{ hostname: "idsn.co.kr", pathPrefix: "/news/data/" },
	{ hostname: "image.edaily.co.kr", pathPrefix: "/images/Photo/" },
	{ hostname: "image.news1.kr", pathPrefix: "/system/photos/" },
	{ hostname: "img.asiatoday.co.kr", pathPrefix: "/file/" },
	{ hostname: "minfo.lotteshopping.com", pathPrefix: "/content/news/" },
	{ hostname: "shinsegae-prd-data.s3.ap-northeast-2.amazonaws.com", pathPrefix: "/wp-content/uploads/" },
	{ hostname: "storage.googleapis.com", pathPrefix: "/nemoneai-thumbnails/" },
	{ hostname: "www.businesspost.co.kr", pathPrefix: "/news/photo/" },
	{ hostname: "www.sentv.co.kr", pathPrefix: "/data/sentv/image/" }
];

export function isOptimizablePopupImage(src: string) {
	if (!URL.canParse(src)) {
		return false;
	}

	const { protocol, hostname, pathname } = new URL(src);

	return (
		protocol === "https:" &&
		POPUP_IMAGE_SOURCES.some((source) => source.hostname === hostname && pathname.startsWith(source.pathPrefix))
	);
}
