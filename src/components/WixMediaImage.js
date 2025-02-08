import { media as wixMedia } from '@wix/sdk';
import Image from 'next/image';

const PLACEHOLDER_IMAGE = '/placeholder-image.jpg';

function getImageUrlForMedia(media, width, height) {
    if (!media) {
        return PLACEHOLDER_IMAGE;
    }

    if (typeof media === 'string') {
        if (media.startsWith('wix:image')) {
            const wixUrl = wixMedia.getScaledToFillImageUrl(media, width, height, {
                quality: 90,
                progressive: true
            });
            return wixUrl;
        }
        return media;
    }

    if (media.url) {
        return media.url;
    }

    if (media.src) {
        return media.src;
    }

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

    const imageUrl = getImageUrlForMedia(media, width * 2, height * 2); // Request 2x size for retina displays

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