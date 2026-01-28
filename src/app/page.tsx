import Image from 'next/image';
import { AuthForm } from '@/components/auth-form';
import placeholderImageData from '@/lib/placeholder-images.json';

export default function AuthenticationPage() {
  const loginBgImage = placeholderImageData.placeholderImages.find(img => img.id === 'login-background');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <AuthForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginBgImage && (
          <Image
            src={loginBgImage.imageUrl}
            alt={loginBgImage.description}
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint={loginBgImage.imageHint}
            priority
          />
        )}
      </div>
    </div>
  );
}
