'use client';
import { useRouter } from 'next/navigation';
import ClassDetailView_New from '../components/ClassDetailView_New';

export default function ClassDetailPage({ params }) {
  const router = useRouter();
  
  return (
    <ClassDetailView_New 
      classId={params.id} 
      onBack={() => router.push('/apps/classes')}
    />
  );
}