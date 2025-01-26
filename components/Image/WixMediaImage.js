import { media as wixMedia } from '@wix/sdk';
import Image from 'next/image';

const PLACEHOLDER_IMAGE = '/placeholder-image.jpg';

function getImageUrlForMedia(media, width, height) {
    console.log('Processing media:', media);

    if (!media) {
        console.log('No media provided, using placeholder');
        return PLACEHOLDER_IMAGE;
    }

    if (typeof media === 'string') {
        if (media.startsWith('wix:image')) {
            const wixUrl = wixMedia.getScaledToFillImageUrl(media, width, height, {});
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
    sizes = '10vw',
    objectFit,
    disableZoom = false,
}) {
    console.log('WixMediaImage props:', { media, height, width, alt, objectFit });

    const imageUrl = getImageUrlForMedia(media, width, height);
    console.log('Final image URL:', imageUrl);

    const styleProps = objectFit
        ? { style: { objectFit }, fill: true, sizes }
        : { width, height };

    return (
        <div className="flex items-center justify-center h-full">
            <div className="overflow-hidden relative group w-full h-full">
                <Image
                    {...styleProps}
                    src={imageUrl}
                    alt={alt}
                    className={`object-cover w-full ${!disableZoom ? 'group-hover:scale-110' : ''
                        } transition duration-300 ease-in-out ${className}`}
                />
            </div>
        </div>
    );
} 