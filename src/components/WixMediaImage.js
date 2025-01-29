import { media as wixMedia } from '@wix/sdk';
import Image from 'next/image';

const PLACEHOLDER_IMAGE = '/placeholder-image.jpg';

function getImageUrlForMedia(media, width, height) {
    if (!media) {
        console.log('No media provided, using placeholder');
        return PLACEHOLDER_IMAGE;
    }

    if (typeof media === 'string') {
        if (media.startsWith('wix:image')) {
            const wixUrl = wixMedia.getScaledToFillImageUrl(media, width, height, {
                quality: 90,
                progressive: true
            });
            console.log('Generated Wix URL:', wixUrl);
            return wixUrl;
        }
        console.log('Using direct URL:', media);
        return media;
    }

    if (media.url) {
        console.log('Using media.url:', media.url);
        return media.url;
    }

    if (media.src) {
        console.log('Using media.src:', media.src);
        return media.src;
    }

    console.log('No valid image format found, using placeholder');
    return PLACEHOLDER_IMAGE;
}

export function WixMediaImage({
    media,
    height = 320,
    width = 640,
    alt = 'no info available for image',
    className = '',
    sizes = '100vw',
    objectFit,
    disableZoom = false,
}) {
    console.log('WixMediaImage props:', { media, height, width, alt, objectFit });

    const imageUrl = getImageUrlForMedia(media, width * 2, height * 2); // Request 2x size for retina displays
    console.log('Final image URL:', imageUrl);

    return (
        <div className="relative w-full h-full">
            <Image
                src={imageUrl}
                alt={alt}
                width={width}
                height={height}
                className={`${className} ${!disableZoom ? 'group-hover:scale-110' : ''} transition duration-300 ease-in-out`}
                sizes={sizes}
                quality={90}
                style={{
                    objectFit: objectFit || 'cover',
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
} 