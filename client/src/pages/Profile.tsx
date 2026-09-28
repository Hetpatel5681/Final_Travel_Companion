import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function Profile() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile Settings</h1>
        <p className="text-slate-600">Manage your account and preferences.</p>
      </div>
      
      <Card>
        <form className="space-y-6">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner">
              WA
            </div>
            <Button variant="outline">Update Avatar</Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Input label="Full Name" defaultValue="User Name" />
            <Input label="Email address" defaultValue="user@example.com" disabled />
          </div>
          <div className="pt-4 flex justify-end">
             <Button>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
