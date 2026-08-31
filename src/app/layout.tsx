import type { Metadata, Viewport } from 'next';
import './globals.css';
import { DashboardProvider } from '@/lib/data/store';
import { AppShell } from '@/components/layout/AppShell';
import { APP_NAME, APP_SUBTITLE } from '@/lib/thesis';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_SUBTITLE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Live progress hub for the Integrated Exposure Index honors thesis, embedded in the BREATHE-CC pediatric respiratory health cohort at Rollins College.',
  applicationName: APP_NAME,
  authors: [{ name: 'Aidan Meyers' }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#213c4e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DashboardProvider>
          <AppShell>{children}</AppShell>
        </DashboardProvider>
      </body>
    </html>
  );
}
