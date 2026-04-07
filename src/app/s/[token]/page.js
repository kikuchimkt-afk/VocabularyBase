import StudentDashboard from './StudentDashboard';
import StudentManifestInjector from './StudentManifestInjector';

export default async function StudentPage({ params }) {
  const { token } = await params;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <StudentManifestInjector />
      <StudentDashboard token={token} />
    </div>
  );
}
