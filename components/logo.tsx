import { cn } from '@/lib/utils'
import Image from 'next/image'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/Africup.svg"
            alt="Africon Logo"
            width={40}
            height={40}
            className={cn('h-10 w-auto', className)}
        />
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/Africup.svg"
            alt="Africon"
            width={32}
            height={32}
            className={cn('size-8', className)}
        />
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <Image
            src="/Africup.svg"
            alt="Africon"
            width={28}
            height={28}
            className={cn('size-7 w-7', className)}
        />
    )
}
