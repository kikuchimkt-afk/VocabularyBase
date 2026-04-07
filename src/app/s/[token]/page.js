import StudentDashboard from './StudentDashboard';

export async function generateMetadata({ params }) {
  const { token } = await params;
  return {
    manifest: `/api/manifest?token=${token}`,
  };
}

export default async function StudentPage({ params }) {
  const { token } = await params;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <StudentDashboard token={token} />
    </div>
  );
}
