import StudentDashboard from './StudentDashboard';

export default async function StudentPage({ params }) {
  const { token } = await params;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <StudentDashboard token={token} />
    </div>
  );
}
