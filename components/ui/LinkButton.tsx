import type { VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button, buttonVariants } from './button';

export type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>;

/**
 * Next.js の Link + shadcn/ui Button を組み合わせた再利用可能なリンクボタン
 *
 * @example
 * <LinkButton href="/foo" variant="secondary">Go Foo</LinkButton>
 */
export function LinkButton({
  href,
  children,
  className,
  ...buttonProps
}: LinkButtonProps) {
  return (
    <Link href={href}>
      <Button
        type='button'
        {...buttonProps}
        className={clsx(
          className,
          'transition-colors hover:bg-primary/80 hover:text-white'
        )}
      >
        {children}
      </Button>
    </Link>
  );
}
