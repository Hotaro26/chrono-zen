import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ChronoZen',
    short_name: 'ChronoZen',
    description: 'Manage your tasks, and time with Pomodoro and Stopwatch.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://i.ibb.co/nNB3xmsj/title.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://i.ibb.co/nNB3xmsj/title.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
