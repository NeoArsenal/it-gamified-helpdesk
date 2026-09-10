async function run() {
  // Create ticket via HTTP API
  const res = await fetch('http://localhost:3001/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Test Delete Ticket',
      descripcion: 'Testing deletion',
      sede: 'Sede Central',
      departamento: 'Sistemas',
      area: 'Desarrollo'
    })
  });
  const ticket = await res.json();
  console.log('Created ticket:', ticket.id);

  // Try to delete via HTTP API
  const delRes = await fetch(`http://localhost:3001/api/tickets/${ticket.id}`, {
    method: 'DELETE'
  });
  console.log('Delete status without auth:', delRes.status);
  
  // Try to delete with mock auth
  // Wait, I need a token to delete it because it has JwtAuthGuard!
  // I will just change the backend controller to remove the JwtAuthGuard for delete temporarily, or use an existing token.
  // Wait, if it fails with 401 without auth, the user wouldn't see 404! 
  // If the user is seeing 404, they ARE sending auth!
}

run().catch(console.error);
