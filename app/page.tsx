// File: app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
    // Lệnh này sẽ tự động chuyển hướng người dùng từ / sang /login
    redirect('/login');
}