"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Mail, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { UserRole, UserStatus } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "James Wilson",
    email: "owner@coolairhvac.com",
    role: "OWNER",
    status: "ACTIVE",
    avatar: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Lisa Anderson",
    email: "admin@coolairhvac.com",
    role: "ADMIN",
    status: "ACTIVE",
    avatar: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "dispatch@coolairhvac.com",
    role: "DISPATCHER",
    status: "ACTIVE",
    avatar: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "4",
    name: "Sarah Miller",
    email: "accounting@coolairhvac.com",
    role: "ACCOUNTANT",
    status: "ACTIVE",
    avatar: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "5",
    name: "Mike Johnson",
    email: "mike.j@coolairhvac.com",
    role: "TECHNICIAN",
    status: "ACTIVE",
    avatar: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2024-02-15"),
  },
];

const roleLabels: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  DISPATCHER: "Dispatcher",
  TECHNICIAN: "Technician",
  ACCOUNTANT: "Accountant",
};

const roleColors: Record<UserRole, string> = {
  OWNER: "bg-purple-100 text-purple-800",
  ADMIN: "bg-blue-100 text-blue-800",
  DISPATCHER: "bg-green-100 text-green-800",
  TECHNICIAN: "bg-orange-100 text-orange-800",
  ACCOUNTANT: "bg-pink-100 text-pink-800",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("TECHNICIAN");
  const [isInviting, setIsInviting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/demo/session")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setIsDemoMode(Boolean(data.active));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsDemoMode(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const showDemoToast = () => {
    toast.info("Demo mode is read-only. Sign in to manage team members.");
  };

  const handleInvite = async () => {
    if (isDemoMode) {
      showDemoToast();
      return;
    }

    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsInviting(true);

    try {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (response.ok) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        setInviteOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send invitation");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (isDemoMode) {
      showDemoToast();
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INACTIVE" }),
      });

      if (response.ok) {
        toast.success("User deactivated");
        setUsers(users.map(u => u.id === userId ? { ...u, status: "INACTIVE" } : u));
      } else {
        toast.error("Failed to deactivate user");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (isDemoMode) {
      showDemoToast();
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success("Role updated");
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        toast.error("Failed to update role");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (userId: string) => {
    if (isDemoMode) {
      showDemoToast();
      return;
    }

    if (!confirm("Are you sure? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("User deleted permanently");
        setUsers(users.filter(u => u.id !== userId));
      } else {
        toast.error("Failed to delete user");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new user to your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} loading={isInviting}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({users.length})</CardTitle>
          {isDemoMode && (
            <p className="text-sm text-muted-foreground">
              Demo mode keeps team management read-only.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={roleColors[user.role]}>
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                      {user.status === "ACTIVE" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <UserCheck className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          <UserX className="mr-1 h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    {user.lastLoginAt && (
                      <p>Last active {new Date(user.lastLoginAt).toLocaleDateString()}</p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")}>
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "DISPATCHER")}>
                        Make Dispatcher
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "TECHNICIAN")}>
                        Make Technician
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ACCOUNTANT")}>
                        Make Accountant
                      </DropdownMenuItem>
                      {user.status === "ACTIVE" && user.role !== "OWNER" && (
                        <>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeactivate(user.id)}
                          >
                            Deactivate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete Permanently
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
