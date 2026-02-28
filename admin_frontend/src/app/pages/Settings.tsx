import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export default function Settings() {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };
  const copyToken = () => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    if (!t) { toast.error('No admin token'); return; }
    try {
      navigator.clipboard.writeText(t);
      toast.success('Admin token copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600">
          Configure system preferences and operational parameters
        </p>
      </div>

      <Tabs defaultValue="sla" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sla">SLA Configuration</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* SLA Configuration */}
        <TabsContent value="sla">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              SLA Deadline Configuration
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Set response and resolution times for each priority level (in hours)
            </p>

            <div className="space-y-4">
              {['Emergency', 'High', 'Medium', 'Low'].map((priority) => (
                <div key={priority} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label className="text-sm font-medium">{priority} Priority</Label>
                  </div>
                  <div>
                    <Label htmlFor={`${priority}-response`} className="text-xs text-gray-600">
                      Response Time
                    </Label>
                    <Input
                      id={`${priority}-response`}
                      type="number"
                      defaultValue={priority === 'Emergency' ? 1 : priority === 'High' ? 4 : priority === 'Medium' ? 12 : 24}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${priority}-resolution`} className="text-xs text-gray-600">
                      Resolution Time
                    </Label>
                    <Input
                      id={`${priority}-resolution`}
                      type="number"
                      defaultValue={priority === 'Emergency' ? 6 : priority === 'High' ? 24 : priority === 'Medium' ? 48 : 72}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Department-Specific SLA
            </h3>

            <div className="space-y-4">
              {['Water', 'Roads', 'Sanitation', 'Electricity'].map((dept) => (
                <div key={dept} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label className="text-sm font-medium">{dept}</Label>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Default SLA (hours)</Label>
                    <Input type="number" defaultValue={24} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Override Enabled</Label>
                    <div className="mt-2">
                      <Switch />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Save SLA Configuration</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Priority Configuration */}
        <TabsContent value="priorities">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Priority Levels
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Configure priority escalation rules and criteria
            </p>

            <div className="space-y-4">
              {['Emergency', 'High', 'Medium', 'Low'].map((priority) => (
                <div key={priority} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">{priority} Priority</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">Auto-escalation threshold (hours)</Label>
                      <Input type="number" defaultValue={24} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Notification frequency</Label>
                      <Input type="text" placeholder="e.g., Every 2 hours" className="mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Save Priority Configuration</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Settings
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Control notification preferences and alerts
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Emergency Alerts</p>
                  <p className="text-sm text-gray-600">
                    Receive alerts for emergency priority tickets
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">SLA Breach Warnings</p>
                  <p className="text-sm text-gray-600">
                    Get notified when tickets are approaching SLA deadline
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Assignment Notifications</p>
                  <p className="text-sm text-gray-600">
                    Notifications when tickets are assigned or reassigned
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Daily Summary Report</p>
                  <p className="text-sm text-gray-600">
                    Receive a daily summary of system activity
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Citizen Feedback Notifications</p>
                  <p className="text-sm text-gray-600">
                    Alerts for new citizen feedback and ratings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave}>Save Notification Settings</Button>
            </div>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Configuration
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              General system settings and preferences
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="system-name">System Name</Label>
                <Input
                  id="system-name"
                  defaultValue="SUVIDHA Command Center"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  defaultValue="admin@suvidha.gov.in"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="support-phone">Support Phone Number</Label>
                <Input
                  id="support-phone"
                  type="tel"
                  defaultValue="+91 1234567890"
                  className="mt-2"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">
                    Enable maintenance mode to prevent citizen access
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-backup</p>
                  <p className="text-sm text-gray-600">
                    Automatically backup data daily at midnight
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Debug Mode</p>
                  <p className="text-sm text-gray-600">
                    Enable detailed logging for troubleshooting
                  </p>
                </div>
                <Switch />
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Admin Token</p>
                    <p className="text-xs text-gray-600">JWT used for admin API requests (local browser storage)</p>
                  </div>
                  <Button variant="outline" onClick={copyToken}>Copy Token</Button>
                </div>
                <div className="mt-3 text-xs text-gray-500 break-all">
                  {typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || 'No token') : 'No token'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={handleSave}>Save System Settings</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
