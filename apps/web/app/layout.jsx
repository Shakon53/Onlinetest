import './globals.css';
import { I18nProvider } from '../components/I18nProvider';

export const metadata = {
  title: 'OnlineTest LMS',
  description: 'Modern LMS platform for online learning and student testing'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
