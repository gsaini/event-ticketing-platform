import { Card, CardContent, CardHeader, CardTitle } from '@ticketing/ui';

export function UserManagementPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User management table with search, filter, and role management will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
