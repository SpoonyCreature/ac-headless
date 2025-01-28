import Image from 'next/image';

interface WixMediaImageProps {
    media: {
        url: string;
        height?: number;
        width?: number;
    };
    width?: number;
    height?: number;
    className?: string;
}

export function WixMediaImage({ media, width, height, className }: WixMediaImageProps) {
    return (
        <Image
            src={media.url}
            alt=""
            width={width || media.width || 1200}
            height={height || media.height || 800}
            className={className}
        />
    );
} 