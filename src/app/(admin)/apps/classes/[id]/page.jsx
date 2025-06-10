'use client';
import ClassDetailView from '../components/ClassDetailView';

export default function ClassDetailPage({ params }) {
  return <ClassDetailView classId={params.id} />;
}